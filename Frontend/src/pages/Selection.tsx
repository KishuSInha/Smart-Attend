import { useNavigate } from "react-router-dom";
import { LogIn, Camera, ArrowLeft } from "lucide-react";

const Selection = () => {
  const navigate = useNavigate();

  const options = [
    {
      id: "login",
      title: "Login",
      description: "Access your dashboard based on your role",
      icon: LogIn,
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30",
      action: () => navigate("/login")
    },
    {
      id: "camera",
      title: "Camera Attendance",
      description: "Use face recognition for quick attendance marking",
      icon: Camera,
      color: "bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30",
      action: () => navigate("/camera-attendance")
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Choose Access Method</h1>
              <p className="text-sm text-muted-foreground">Select how you want to access Smart Attend</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className={`${option.color} rounded-2xl p-8 border shadow-lg cursor-pointer card-hover transition-all duration-300 hover:shadow-xl`}
                onClick={option.action}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center shadow-md">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      {option.title}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 opacity-50">
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,234</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">89</div>
              <div className="text-sm text-muted-foreground">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">12</div>
              <div className="text-sm text-muted-foreground">Schools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">94%</div>
              <div className="text-sm text-muted-foreground">Attendance</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Selection;