import { Icon } from '../components/icons/Icon'
import { PageIntro } from '../components/ui/PageIntro'
import { SectionHeading } from '../components/ui/SectionHeading'
import { useLanguage } from '../context/LanguageContext'
import { images } from '../data/images'

export function AboutPage() {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const copy = isVi
    ? {
        eyebrow: 'Về chúng tôi',
        title: 'Thương hiệu lưu trú hướng đến trải nghiệm tinh tế',
        intro:
          'Câu chuyện thương hiệu, hình ảnh, đội ngũ lãnh đạo và giải thưởng được trình bày theo phong cách cao cấp nhất quán.',
        storyEyebrow: 'Câu chuyện của chúng tôi',
        storyTitle: 'Xây dựng từ trải nghiệm đón tiếp nhẹ nhàng và chăm sóc khách tỉ mỉ.',
        storyBody:
          'VIP Booking kết hợp quản lý phòng, hỗ trợ khách hàng, rà soát đặt phòng, thanh toán và vận hành quản trị trong một trải nghiệm thống nhất dành cho khách sạn cao cấp.',
        leadershipEyebrow: 'Lãnh đạo',
        leadershipTitle: 'Đội ngũ điều hành',
        ceo: 'Tổng giám đốc điều hành',
        guestExp: 'Giám đốc trải nghiệm khách hàng',
        opsDirector: 'Giám đốc vận hành',
        award1: 'Giải thưởng Du lịch Cao cấp',
        award2: 'Dịch vụ chăm sóc khách 5 sao',
        award3: 'Giải thưởng Thiết kế Xuất sắc',
        award4: 'Khách sạn Xanh tiêu biểu',
        exteriorAlt: 'Mặt tiền khách sạn VIP Booking',
        lobbyAlt: 'Sảnh khách sạn',
        poolAlt: 'Khu hồ bơi',
        diningAlt: 'Không gian nhà hàng',
      }
    : {
        eyebrow: 'About us',
        title: 'A hospitality brand for precise luxury',
        intro:
          'Story, imagery, leadership, and awards laid out with the same dark premium language as the demo.',
        storyEyebrow: 'Our story',
        storyTitle: 'Built around calm arrivals and exacting guest care.',
        storyBody:
          'VIP Booking combines room inventory, concierge services, booking review, payment, and admin operations into a single front-end experience for premium hotel teams.',
        leadershipEyebrow: 'Leadership',
        leadershipTitle: 'Executive leadership',
        ceo: 'Chief Executive Officer',
        guestExp: 'Head of Guest Experience',
        opsDirector: 'Director of Operations',
        award1: 'Luxury Travel Award',
        award2: 'Five Star Guest Care',
        award3: 'Design Excellence',
        award4: 'Green Hotel Leader',
        exteriorAlt: 'VIP Booking hotel exterior',
        lobbyAlt: 'Hotel lobby',
        poolAlt: 'Pool view',
        diningAlt: 'Restaurant table',
      }

  return (
    <main className="page-shell about-page">
      <PageIntro
        eyebrow={copy.eyebrow}
        title={copy.title}
        copy={copy.intro}
      />

      <section className="about-hero">
        <img src={images.exterior} alt={copy.exteriorAlt} />
        <div>
          <p className="eyebrow">{copy.storyEyebrow}</p>
          <h2>{copy.storyTitle}</h2>
          <p>{copy.storyBody}</p>
        </div>
      </section>

      <section className="image-strip">
        <img src={images.lobby} alt={copy.lobbyAlt} loading="lazy" />
        <img src={images.pool} alt={copy.poolAlt} loading="lazy" />
        <img src={images.dining} alt={copy.diningAlt} loading="lazy" />
      </section>

      <section className="section-shell leadership-section">
        <SectionHeading eyebrow={copy.leadershipEyebrow} title={copy.leadershipTitle} />
        <div className="leader-grid">
          {[
            ['Jonathan Sterling', copy.ceo, images.portraitOne],
            ['Elena Moore', copy.guestExp, images.portraitTwo],
            ['Marcus Tran', copy.opsDirector, images.portraitThree],
          ].map(([name, role, image]) => (
            <article className="leader-card" key={name}>
              <img src={image} alt={name} loading="lazy" />
              <h3>{name}</h3>
              <p>{role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="award-grid">
        {[
          copy.award1,
          copy.award2,
          copy.award3,
          copy.award4,
        ].map((award) => (
          <article className="award-card" key={award}>
            <Icon name="award" />
            <span>{award}</span>
          </article>
        ))}
      </section>
    </main>
  )
}
