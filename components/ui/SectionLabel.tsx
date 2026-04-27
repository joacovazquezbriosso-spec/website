interface SectionLabelProps {
  number: string
  label: string
}

export default function SectionLabel({ number, label }: SectionLabelProps) {
  return (
    <p className="font-cormorant text-gold text-xs tracking-widest2 uppercase mb-12">
      {number} — {label}
    </p>
  )
}
