type FiltersContainerProps = {
  children: React.ReactNode
}

export default function FiltersContainer({
  children,
}: FiltersContainerProps) {

  return (

    <div
      className="
        flex flex-col
        md:flex-row

        gap-3

        rounded-2xl

        bg-[#0b1513]/70

        border border-emerald-900/40

        backdrop-blur

        shadow-lg shadow-black/30

        p-4
      "
    >
      {children}
    </div>
  )
}