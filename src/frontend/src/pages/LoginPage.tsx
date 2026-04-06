import { Button } from "@/components/ui/button";
import { Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const features = [
    {
      icon: Shield,
      title: "Predictive Maintenance",
      description: "AI-powered insights before problems occur",
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description: "Instant notifications for critical issues",
    },
    {
      icon: TrendingUp,
      title: "Health Tracking",
      description: "Monitor all appliances in one place",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 sidebar-gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-400/40">
              <img
                src="/assets/generated/aura-ring-transparent.dim_80x80.png"
                alt="AuraHome"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight">
                AuraHome
              </span>
              <p className="text-white/40 text-xs">Smart Home Intelligence</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Predict. Prevent.
            <br />
            <span className="text-blue-400">Protect.</span>
          </h2>
          <p className="text-white/50 text-lg mb-12">
            Your intelligent home maintenance assistant that keeps your
            appliances running at peak performance.
          </p>
          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <p className="text-white/20 text-xs">
          Secured by Internet Identity — your data, your control.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-400/40">
              <img
                src="/assets/generated/aura-ring-transparent.dim_80x80.png"
                alt="AuraHome"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-xl text-foreground">AuraHome</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your smart home dashboard
          </p>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mx-auto mb-6">
              <Shield size={28} className="text-blue-500" />
            </div>
            <h2 className="text-center text-lg font-semibold text-foreground mb-2">
              Secure Login
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-7">
              Authenticate with Internet Identity — no passwords, no tracking.
            </p>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
              className="w-full h-12 text-sm font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              New users are automatically registered on first login.
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
