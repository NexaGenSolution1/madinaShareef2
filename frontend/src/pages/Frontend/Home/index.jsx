import Login from '../../Auth/Login'
import HeroSection from '../../../components/HeroSection'
import AboutSection from '../../../components/AboutSection'
import ServicesSection from '../../../components/ServicesSection'
import ChooseUsSection from '../../../components/ChooseUsSection'

export default function Home({user, onLogin}) {
    return (
        <>
            {
                user ? <HeroSection /> : <Login onLogin={onLogin} />
            }
            <AboutSection />
            <ServicesSection />
            <ChooseUsSection />
        </>
    )
}