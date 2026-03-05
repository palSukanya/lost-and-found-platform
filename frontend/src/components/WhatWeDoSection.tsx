import { Search, Users, MessageCircle, Shield, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find Your Lost Soul... Items",
    description: "Lost your charger for the 47th time? We get it. Our advanced 'someone-please-help' algorithm connects you with people who actually found your stuff.",
    color: "primary",
  },
  {
    icon: Users,
    title: "Community of Chaos",
    description: "Join thousands of fellow forgetful humans. It's like a support group, but for people who can't remember where they put their ID card 5 minutes ago.",
    color: "secondary",
  },
  {
    icon: MessageCircle,
    title: "Anonymous Confessions",
    description: "Post your lost items without the shame. Yes, we know you lost your lunch box in the library. No judgment here, fellow disaster.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Verified Chaos",
    description: "We verify finders to make sure your stuff goes to the right place. Or at least, someone who won't 'accidentally' keep your AirPods.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Lightning Fast Reunions",
    description: "Get notifications faster than you can say 'Where's my calculator?' Real-time alerts because we know you're anxious about that pen.",
    color: "secondary",
  },
  {
    icon: Heart,
    title: "Feel-Good Karma",
    description: "Return items, earn karma points, feel superior to everyone. It's basically being a superhero but with less spandex.",
    color: "accent",
  },
];

const WhatWeDoSection = () => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          icon: "text-primary",
          bg: "bg-primary/10",
          border: "hover:border-primary/50",
          glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
        };
      case "secondary":
        return {
          icon: "text-secondary",
          bg: "bg-secondary/10",
          border: "hover:border-secondary/50",
          glow: "group-hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)]",
        };
      case "accent":
        return {
          icon: "text-accent",
          bg: "bg-accent/10",
          border: "hover:border-accent/50",
          glow: "group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)]",
        };
      default:
        return {
          icon: "text-primary",
          bg: "bg-primary/10",
          border: "hover:border-primary/50",
          glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
        };
    }
  };

  return (
    <section id="what-we-do" className="py-24 relative">
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass-card border-primary/30 text-primary font-mono text-sm mb-6">
            // WHAT_WE_DO.exe
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-foreground">What the </span>
            <span className="text-gradient">Fork</span>
            <span className="text-foreground"> Do We Do?</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Great question. We ask ourselves that every day. But here's the official answer 
            for the investors and your curious parents:
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`group glass-card rounded-2xl p-6 border-border/30 ${colors.border} ${colors.glow} transition-all duration-500 hover:-translate-y-2`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl ${colors.bg} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="font-display font-bold text-xl mb-3 text-foreground group-hover:text-gradient transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
