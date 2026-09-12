import { images } from '../data/images'
import type { Navigate } from '../types'

export function NotFoundPage({ navigate }: { navigate: Navigate }) {
  return (
    <main className="not-found" style={{ backgroundImage: `url(${images.lobby})` }}>
      <section>
        <span>404</span>
        <h1>Page not found</h1>
        <p>The page may have moved or the booking link is no longer active.</p>
        <div>
          <button className="primary-button" type="button" onClick={() => navigate('home')}>
            Go Home
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate('contact')}>
            Contact Support
          </button>
        </div>
      </section>
    </main>
  )
}
