import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  theme = "dark",
  ...props
}) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#121620] group-[.toaster]:text-slate-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-orange-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
