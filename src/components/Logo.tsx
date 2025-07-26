export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "icon-only";
};
const Logo = ({
  size = "md",
  variant = "horizontal"
}: LogoProps) => {
  const sizes = {
    sm: {
      icon: "text-lg",
      text: "text-lg"
    },
    md: {
      icon: "text-xl",
      text: "text-xl"
    },
    lg: {
      icon: "text-2xl",
      text: "text-2xl"
    }
  };
  return <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full transform -translate-y-1 translate-x-1"></div>
        
      </div>
      
      {variant === "horizontal" && <div className="font-semibold tracking-tight text-4xl">
          <h1 className="pb-[15px]" style={{minHeight: 'fit-content'}}>
            <span style={{color: 'rgb(0, 128, 255)', fontWeight: 'normal'}}>
              ரூ
            </span>
          </h1>
          <h2></h2>
        </div>}
    </div>;
};
export default Logo;
