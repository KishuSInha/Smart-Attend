import { useNavigate } from "react-router-dom";
import { User, Camera, Shield, Check } from "lucide-react";
import heroImage from "@/assets/hero-classroom.png";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Smart Attend</h1>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <button className="text-white">☀️</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="relative h-[85vh] md:h-screen flex items-center justify-center">
          {/* Hero Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})`
            }}
          />
          
          {/* Hero Content */}
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{t('Welcome to Smart Attend')}</h1>
            <p className="text-xl md:text-2xl mb-8 font-medium">
              {t('ਪੰਜਾਬ ਵਿੱਚ ਸਿੱਖਿਆ ਲਈ ਇੱਕ ਡਿਜੀਟਲ ਛਾਲ।')}
            </p>
            
            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('An initiative by the Government of Punjab to modernize attendance tracking in government schools, ensuring transparency and improving student regularity.')}
              <br />
              {t('Simple to Use • Accessible Anywhere • Real-time Data')}
            </p>

            {/* Get Started Button */}
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl mb-12"
            >
               {t('Login')} 🎓
            </button>

            {/* Feature Icons */}
            <div className="flex justify-center space-x-8 md:space-x-16">
              <button
                className="flex flex-col items-center space-y-2 text-white hover:text-blue-300 transition-colors"
              >
                <User className="w-8 h-8" />
                <span className="text-sm">Manual Entry</span>
              </button>
              
              <button
                className="flex flex-col items-center space-y-2 text-white hover:text-blue-300 transition-colors"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm">Camera Recognition</span>
              </button>
              
              <button
                className="flex flex-col items-center space-y-2 text-white hover:text-blue-300 transition-colors"
              >
                <Shield className="w-8 h-8" />
                <span className="text-sm">Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Features Section */}
        <div className="bg-background py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-foreground">System Features</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Offline-capable demo mode</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Mobile-first responsive design</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Multiple attendance methods</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Educational department reporting</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground">Lightweight & accessible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
