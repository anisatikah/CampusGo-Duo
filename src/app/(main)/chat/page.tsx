import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ChatPage() {
  const whatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '601XXXXXXXXX'

  return (
    <div>
      <TopBar title="Support Chat" />
      <div className="px-4 py-6 flex flex-col gap-5">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.527 5.845L.057 23.882l6.187-1.623A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.643-.52-5.15-1.42l-.37-.217-3.672.963.981-3.584-.24-.381A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold font-poppins text-text-primary">Chat with Us</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-xs mx-auto">
            We're available on WhatsApp. Send us a message and we'll reply as soon as possible.
          </p>
        </div>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
              <span className="text-green-800 font-bold text-sm">CG</span>
            </div>
            <div>
              <p className="font-semibold text-text-primary">CampusGo Support</p>
              <p className="text-xs text-green-600">● Usually replies within 30 min</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsapp}?text=Hi%20CampusGo%2C%20I%20need%20help%20with%20my%20order!`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button fullWidth className="bg-green-600 hover:bg-green-700">
              Open WhatsApp Chat
            </Button>
          </a>
        </Card>

        <div className="flex flex-col gap-3">
          {[
            { q: 'How do I track my storage order?', a: 'Go to Orders tab and tap on your storage order to see real-time status.' },
            { q: 'How do I pay?', a: 'Payment is made via bank transfer or DuitNow. Our team will send payment details after booking.' },
            { q: 'Can I cancel my order?', a: 'Contact us on WhatsApp within 1 hour of booking for free cancellation.' },
          ].map(({ q, a }) => (
            <Card key={q} padding="md">
              <p className="font-semibold text-sm text-text-primary mb-1">{q}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
