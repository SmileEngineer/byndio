import byndioLogo from '../../assets/byndio-logo-header.webp';

interface BrandLogoProps {
  size?: 'sm' | 'lg';
  showTagline?: boolean;
}

export function BrandLogo({ size = 'sm', showTagline = false }: BrandLogoProps) {
  const dimensions =
    size === 'sm'
      ? {
          width: 172,
          className: 'h-11',
        }
      : {
          width: 276,
          className: 'h-16',
        };

  return (
    <div className="inline-flex flex-col">
      <div className="inline-flex items-center rounded-xl bg-transparent px-0 py-0">
        <img
          src={byndioLogo}
          alt="Byndio"
          width={dimensions.width}
          className={`${dimensions.className} w-auto object-contain`}
          loading="eager"
        />
      </div>
      {showTagline ? (
        <div
          className={`${
            size === 'sm' ? 'mt-0.5 text-[10px]' : 'mt-1 text-xs'
          } pl-2 tracking-[0.12em] text-muted-foreground`}
        >
          SHOP | SELL | EARN
        </div>
      ) : null}
    </div>
  );
}
