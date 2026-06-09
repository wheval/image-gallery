type CornerBorderProps = {
  borderClass?: string
}

export function CornerBorder({ borderClass = 'border-ink/40' }: CornerBorderProps) {
  const line = `absolute border-dashed ${borderClass}`

  return (
    <div className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {/* top-left */}
      <span className={`${line} top-0 left-0 h-0 w-3 border-t`} />
      <span className={`${line} top-0 left-0 h-3 w-0 border-l`} />

      {/* top-right */}
      <span className={`${line} top-0 right-0 h-0 w-3 border-t`} />
      <span className={`${line} top-0 right-0 h-3 w-0 border-r`} />

      {/* bottom-left */}
      <span className={`${line} bottom-0 left-0 h-0 w-3 border-b`} />
      <span className={`${line} bottom-0 left-0 h-3 w-0 border-l`} />

      {/* bottom-right */}
      <span className={`${line} bottom-0 right-0 h-0 w-3 border-b`} />
      <span className={`${line} bottom-0 right-0 h-3 w-0 border-r`} />
    </div>
  )
}
