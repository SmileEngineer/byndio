import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';

const createTicketSchema = z.object({
  channel: z.enum(['chat', 'email', 'whatsapp']),
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(8).max(2000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z
    .enum(['onboarding', 'gst_compliance', 'orders', 'payments', 'returns', 'technical', 'other'])
    .default('other'),
  relatedOrderId: z.string().trim().optional(),
});

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  resolutionNote: z.string().trim().max(1000).optional(),
});

const router = Router();
router.use(requireAuth);

router.post('/tickets', async (req, res) => {
  try {
    const input = parseBody(createTicketSchema, req.body);

    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      if (input.relatedOrderId) {
        const orderExists = (db.orders || []).some((order) => order.id === input.relatedOrderId);
        if (!orderExists) {
          const error = new Error('Related order not found.');
          error.statusCode = 404;
          throw error;
        }
      }

      const ticket = {
        id: crypto.randomUUID(),
        ticketNumber: `SUP-${Date.now().toString().slice(-7)}`,
        userId: user.id,
        userRole: user.role,
        channel: input.channel,
        subject: input.subject,
        message: input.message,
        priority: input.priority,
        category: input.category,
        relatedOrderId: input.relatedOrderId || null,
        status: 'open',
        messages: [
          {
            id: crypto.randomUUID(),
            senderUserId: user.id,
            message: input.message,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
      };

      db.supportTickets.push(ticket);
      addAuditLog(db, {
        actorUserId: user.id,
        action: 'support_ticket_created',
        entityType: 'supportTicket',
        entityId: ticket.id,
        metadata: {
          channel: ticket.channel,
          category: ticket.category,
        },
      });

      return ticket;
    });

    return res.status(201).json({ ticket: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/tickets/mine', async (req, res) => {
  try {
    const db = await readDb();
    const tickets = (db.supportTickets || [])
      .filter((ticket) => ticket.userId === req.auth.sub)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({
      total: tickets.length,
      tickets,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/tickets', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const db = await readDb();
    const tickets = (db.supportTickets || [])
      .filter((ticket) => (req.auth.role === 'admin' ? true : ticket.userId === req.auth.sub))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({
      total: tickets.length,
      tickets,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/tickets/:ticketId', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const input = parseBody(updateTicketSchema, req.body);

    const result = await updateDb(async (db) => {
      const ticket = (db.supportTickets || []).find((entry) => entry.id === req.params.ticketId);
      if (!ticket) {
        const error = new Error('Support ticket not found.');
        error.statusCode = 404;
        throw error;
      }

      if (req.auth.role !== 'admin' && ticket.userId !== req.auth.sub) {
        const error = new Error('You can only update your own support tickets.');
        error.statusCode = 403;
        throw error;
      }

      ticket.status = input.status;
      ticket.updatedAt = new Date().toISOString();

      if (input.status === 'resolved' || input.status === 'closed') {
        ticket.resolvedAt = new Date().toISOString();
      }

      if (input.resolutionNote) {
        ticket.messages.push({
          id: crypto.randomUUID(),
          senderUserId: req.auth.sub,
          message: input.resolutionNote,
          createdAt: new Date().toISOString(),
          type: 'resolution_note',
        });
      }

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'support_ticket_updated',
        entityType: 'supportTicket',
        entityId: ticket.id,
        metadata: {
          status: ticket.status,
        },
      });

      return ticket;
    });

    return res.json({ ticket: result });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
