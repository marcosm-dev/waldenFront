# Walden Adventures GC - Exportación para Astro

Este archivo contiene todo el código necesario para recrear la landing page en Astro con Tailwind CSS.

---

## 1. Estructura de proyecto Astro

```
src/
├── components/
│   ├── Header.astro
│   ├── Hero.astro
│   ├── Experiences.astro
│   ├── Philosophy.astro
│   ├── Pricing.astro
│   ├── Contact.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
└── styles/
    └── global.css
```

---

## 2. Configuración Tailwind (tailwind.config.mjs)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: "hsl(var(--card))",
        ocean: {
          DEFAULT: "hsl(var(--ocean))",
          light: "hsl(var(--ocean-light))",
        },
        sand: "hsl(var(--sand))",
        forest: {
          DEFAULT: "hsl(var(--forest))",
          light: "hsl(var(--forest-light))",
        },
        terracotta: "hsl(var(--terracotta))",
        cream: "hsl(var(--cream))",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
```

---

## 3. Estilos globales (src/styles/global.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

@layer base {
  :root {
    /* Core palette */
    --background: 45 30% 97%;
    --foreground: 150 25% 15%;
    --card: 45 25% 95%;
    --primary: 158 35% 25%;
    --secondary: 35 40% 88%;
    --muted: 150 15% 90%;
    --muted-foreground: 150 15% 40%;
    --border: 150 15% 85%;

    /* Custom tokens */
    --ocean: 200 55% 45%;
    --ocean-light: 200 45% 65%;
    --sand: 35 40% 88%;
    --forest: 158 35% 25%;
    --forest-light: 158 25% 40%;
    --terracotta: 18 50% 55%;
    --cream: 45 30% 97%;

    /* Gradients */
    --gradient-hero: linear-gradient(180deg, hsl(var(--forest) / 0.7) 0%, hsl(var(--forest) / 0.3) 100%);
    --gradient-sand: linear-gradient(180deg, hsl(var(--sand)) 0%, hsl(var(--cream)) 100%);

    /* Shadows */
    --shadow-soft: 0 4px 20px -4px hsl(var(--forest) / 0.1);
    --shadow-card: 0 8px 30px -8px hsl(var(--forest) / 0.15);
    --shadow-elevated: 0 20px 50px -15px hsl(var(--forest) / 0.2);
  }

  body {
    @apply bg-background text-foreground font-body antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}

@layer utilities {
  .gradient-hero {
    background: var(--gradient-hero);
  }
  .gradient-sand {
    background: var(--gradient-sand);
  }
  .shadow-soft {
    box-shadow: var(--shadow-soft);
  }
  .shadow-card {
    box-shadow: var(--shadow-card);
  }
  .shadow-elevated {
    box-shadow: var(--shadow-elevated);
  }
}
```

---

## 4. Layout base (src/layouts/Layout.astro)

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Experiencias al aire libre en Gran Canaria para disfrutar con calma. Kayak, senderismo, paddle surf y comidas en la naturaleza." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

---

## 5. Componentes

### Header.astro

```astro
---
const navLinks = [
  { href: "#experiences", label: "Experiencias" },
  { href: "#philosophy", label: "Filosofía" },
  { href: "#pricing", label: "Precios" },
  { href: "#contact", label: "Contacto" },
];
---

<header id="header" class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent py-6">
  <div class="container mx-auto px-6 flex items-center justify-between">
    <a href="#" class="flex items-center gap-3">
      <span id="logo-text" class="font-heading text-2xl font-semibold transition-colors duration-300 text-cream">
        Walden Adventures
      </span>
      <span id="logo-gc" class="text-sm font-body tracking-widest transition-colors duration-300 text-cream/80">
        GC
      </span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
        <a
          href={link.href}
          class="nav-link font-body text-sm tracking-wide transition-all duration-300 hover:opacity-70 text-cream"
        >
          {link.label}
        </a>
      ))}
      <a href="#contact" id="cta-btn" class="px-6 py-2 border border-cream text-cream rounded-full text-sm font-body hover:bg-cream hover:text-forest transition-all">
        Reservar
      </a>
    </nav>

    <!-- Mobile Menu Button -->
    <button id="mobile-menu-btn" class="md:hidden text-cream">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" x2="20" y1="12" y2="12"></line>
        <line x1="4" x2="20" y1="6" y2="6"></line>
        <line x1="4" x2="20" y1="18" y2="18"></line>
      </svg>
    </button>
  </div>

  <!-- Mobile Menu -->
  <div id="mobile-menu" class="md:hidden hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-md shadow-card">
    <nav class="container mx-auto px-6 py-6 flex flex-col gap-4">
      {navLinks.map((link) => (
        <a href={link.href} class="font-body text-foreground py-2 border-b border-border">
          {link.label}
        </a>
      ))}
      <a href="#contact" class="mt-2 px-6 py-3 bg-primary text-cream rounded-full text-center font-body">
        Reservar
      </a>
    </nav>
  </div>
</header>

<script>
  const header = document.getElementById('header');
  const logoText = document.getElementById('logo-text');
  const logoGc = document.getElementById('logo-gc');
  const navLinks = document.querySelectorAll('.nav-link');
  const ctaBtn = document.getElementById('cta-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('bg-background/95', 'backdrop-blur-md', 'shadow-soft', 'py-4');
      header?.classList.remove('bg-transparent', 'py-6');
      logoText?.classList.add('text-forest');
      logoText?.classList.remove('text-cream');
      logoGc?.classList.add('text-muted-foreground');
      logoGc?.classList.remove('text-cream/80');
      navLinks.forEach(link => {
        link.classList.add('text-foreground');
        link.classList.remove('text-cream');
      });
      ctaBtn?.classList.add('border-forest', 'text-forest', 'hover:bg-forest', 'hover:text-cream');
      ctaBtn?.classList.remove('border-cream', 'text-cream', 'hover:bg-cream', 'hover:text-forest');
    } else {
      header?.classList.remove('bg-background/95', 'backdrop-blur-md', 'shadow-soft', 'py-4');
      header?.classList.add('bg-transparent', 'py-6');
      logoText?.classList.remove('text-forest');
      logoText?.classList.add('text-cream');
      logoGc?.classList.remove('text-muted-foreground');
      logoGc?.classList.add('text-cream/80');
      navLinks.forEach(link => {
        link.classList.remove('text-foreground');
        link.classList.add('text-cream');
      });
      ctaBtn?.classList.remove('border-forest', 'text-forest', 'hover:bg-forest', 'hover:text-cream');
      ctaBtn?.classList.add('border-cream', 'text-cream', 'hover:bg-cream', 'hover:text-forest');
    }
  });

  // Mobile menu toggle
  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });
</script>
```

### Hero.astro

```astro
---
import heroImage from '../assets/hero-kayak.jpg';
---

<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
  <!-- Background Image -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={`background-image: url(${heroImage.src})`}
  >
    <div class="absolute inset-0 gradient-hero"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 container mx-auto px-6 text-center">
    <div class="max-w-4xl mx-auto">
      <p class="font-body text-cream/90 text-sm tracking-[0.3em] uppercase mb-6 animate-fade-in" style="animation-delay: 0.2s">
        Gran Canaria, España
      </p>
      <h1 class="font-heading text-5xl md:text-7xl lg:text-8xl text-cream font-medium leading-tight mb-6 animate-fade-in" style="animation-delay: 0.4s">
        Experiencias al aire libre para disfrutar sin prisas
      </h1>
      <p class="font-body text-cream/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style="animation-delay: 0.6s">
        Creamos experiencias al aire libre diseñadas para quienes desean desconectar de la rutina, disfrutar de la naturaleza y compartir buenos momentos en un entorno tranquilo y cuidado.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style="animation-delay: 0.8s">
        <a href="#experiences" class="px-8 py-4 bg-cream text-forest font-body font-medium rounded-full hover:bg-cream/90 transition-all shadow-lg">
          Descubre nuestras experiencias
        </a>
        <a href="#contact" class="px-8 py-4 border-2 border-cream text-cream font-body font-medium rounded-full hover:bg-cream/10 transition-all">
          Contactar
        </a>
      </div>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <a href="#experiences" class="absolute bottom-10 left-1/2 -translate-x-1/2 text-cream/70 hover:text-cream transition-colors animate-float">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </a>
</section>
```

### Experiences.astro

```astro
---
import hikingImage from '../assets/hiking.jpg';
import kayakingImage from '../assets/kayaking.jpg';
import paddlesurfImage from '../assets/paddlesurf.jpg';
import outdoorDiningImage from '../assets/outdoor-dining.jpg';

const experiences = [
  {
    title: "Caminatas",
    description: "Rutas por entornos naturales de Gran Canaria, entre volcanes y pinares, a un ritmo cómodo y accesible.",
    image: hikingImage,
    icon: "mountain"
  },
  {
    title: "Kayak",
    description: "Travesías en zonas tranquilas de la costa, disfrutando del mar y los acantilados desde una perspectiva única.",
    image: kayakingImage,
    icon: "waves"
  },
  {
    title: "Paddle Surf",
    description: "Navega sobre el agua de pie, apto para todos los niveles. Una experiencia relajante y divertida.",
    image: paddlesurfImage,
    icon: "wind"
  },
  {
    title: "Comida al aire libre",
    description: "Paella o asadero en plena naturaleza. Compartir mesa forma parte esencial de la experiencia.",
    image: outdoorDiningImage,
    icon: "utensils"
  },
];

const icons = {
  mountain: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/></svg>`,
  waves: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  wind: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  utensils: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
};
---

<section id="experiences" class="py-24 md:py-32 gradient-sand">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16 md:mb-20">
      <p class="font-body text-ocean text-sm tracking-[0.2em] uppercase mb-4">
        Nuestras experiencias
      </p>
      <h2 class="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
        Elige tu aventura
      </h2>
      <p class="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
        Puedes elegir una actividad concreta o combinar varias en el mismo día. Todas las experiencias incluyen comida.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {experiences.map((experience) => (
        <div class="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-elevated transition-all duration-500">
          <div class="aspect-[4/3] overflow-hidden">
            <img
              src={experience.image.src}
              alt={experience.title}
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-ocean-light" set:html={icons[experience.icon]} />
              <h3 class="font-heading text-2xl md:text-3xl text-cream">
                {experience.title}
              </h3>
            </div>
            <p class="font-body text-cream/85 leading-relaxed">
              {experience.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Philosophy.astro

```astro
---
const features = [
  { icon: "users", title: "Grupos pequeños", description: "Máximo 8 personas por experiencia" },
  { icon: "clock", title: "Ritmo cómodo", description: "Sin prisas, para disfrutar cada momento" },
  { icon: "heart", title: "Sin experiencia previa", description: "Actividades accesibles para todos" },
  { icon: "leaf", title: "Respeto por el entorno", description: "Ambiente íntimo y sostenible" },
];

const icons = {
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  leaf: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
};
---

<section id="philosophy" class="py-24 md:py-32 bg-background">
  <div class="container mx-auto px-6">
    <div class="max-w-6xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Text Content -->
        <div>
          <p class="font-body text-ocean text-sm tracking-[0.2em] uppercase mb-4">
            Nuestra filosofía
          </p>
          <h2 class="font-heading text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            El objetivo no es hacer más, sino disfrutar más
          </h2>
          <p class="font-body text-muted-foreground text-lg leading-relaxed mb-8">
            Trabajamos siempre con grupos reducidos, a un ritmo accesible y con atención al detalle, para que cada salida sea una experiencia íntima, auténtica y sin prisas.
          </p>
          <div class="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div class="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-300">
                <div class="p-2 rounded-lg bg-ocean/10">
                  <span class="text-ocean" set:html={icons[feature.icon]} />
                </div>
                <div>
                  <h4 class="font-heading text-lg text-foreground mb-1">{feature.title}</h4>
                  <p class="font-body text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <!-- Visual Element -->
        <div class="relative">
          <div class="absolute -top-8 -right-8 w-64 h-64 bg-ocean/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-terracotta/10 rounded-full blur-3xl"></div>
          <div class="relative bg-card rounded-3xl p-8 md:p-12 shadow-card border border-border">
            <blockquote class="font-heading text-2xl md:text-3xl text-foreground italic leading-relaxed mb-6">
              "Sin estrés, sin competición, sin necesidad de demostrar nada. Solo tú, la naturaleza y buena compañía."
            </blockquote>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-ocean/20 flex items-center justify-center">
                <span class="font-heading text-xl text-ocean">W</span>
              </div>
              <div>
                <p class="font-body font-medium text-foreground">Walden Adventures GC</p>
                <p class="font-body text-sm text-muted-foreground">Gran Canaria</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Pricing.astro

```astro
---
const experiences = [
  { name: "Caminata + comida", price: "30", description: "Rutas por volcanes y pinares con paella o asadero incluido" },
  { name: "Kayak + comida", price: "47,50", description: "Travesía costera en kayak con comida al aire libre" },
  { name: "Paddle surf + comida", price: "47,50", description: "Navegación sobre el agua para todos los niveles con comida" },
  { name: "Caminata + kayak + comida", price: "55", description: "Jornada completa combinando tierra y mar" },
  { name: "Caminata + paddle surf + comida", price: "55", description: "Aventura doble con senderismo y paddle surf" },
];

const details = [
  { icon: "calendar", title: "Sábados y domingos", description: "Actividades en fin de semana" },
  { icon: "users", title: "4 a 8 personas", description: "Grupos íntimos garantizados" },
  { icon: "credit-card", title: "Reserva con 10 €", description: "El resto el día de la actividad" },
];

const icons = {
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "credit-card": `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
};
---

<section id="pricing" class="py-24 md:py-32 bg-background">
  <div class="container mx-auto px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <p class="font-body text-ocean text-sm tracking-[0.2em] uppercase mb-4">
          Cómo participar
        </p>
        <h2 class="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
          Elige tu experiencia
        </h2>
        <p class="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
          Todas las experiencias incluyen comida porque compartir mesa forma parte esencial de la aventura.
        </p>
      </div>

      <!-- Experience Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {experiences.map((exp) => (
          <div class="group relative p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300">
            <div class="flex items-start justify-between mb-4">
              <h3 class="font-heading text-xl text-foreground pr-4">{exp.name}</h3>
              <div class="text-right shrink-0">
                <span class="font-heading text-2xl text-ocean">{exp.price}€</span>
                <p class="font-body text-xs text-muted-foreground">por persona</p>
              </div>
            </div>
            <p class="font-body text-muted-foreground text-sm leading-relaxed">{exp.description}</p>
            <div class="mt-4 pt-4 border-t border-border/50">
              <div class="flex items-center gap-2 text-sm text-forest">
                <span set:html={icons.check} />
                <span class="font-body">Comida incluida</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <!-- Organization Details -->
      <div class="bg-secondary/30 rounded-3xl p-8 md:p-12">
        <div class="grid md:grid-cols-3 gap-8 mb-10">
          {details.map((detail) => (
            <div class="text-center">
              <div class="w-14 h-14 rounded-2xl bg-ocean/10 flex items-center justify-center mx-auto mb-4">
                <span class="text-ocean" set:html={icons[detail.icon]} />
              </div>
              <h4 class="font-heading text-lg text-foreground mb-1">{detail.title}</h4>
              <p class="font-body text-sm text-muted-foreground">{detail.description}</p>
            </div>
          ))}
        </div>
        <div class="text-center">
          <p class="font-body text-muted-foreground mb-6">
            ¿Tienes alguna pregunta o quieres reservar tu plaza?
          </p>
          <a href="#contact" class="inline-block px-8 py-4 bg-ocean text-cream font-body font-medium rounded-full hover:bg-ocean/90 transition-all">
            Reservar experiencia
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Contact.astro

```astro
---
const icons = {
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  mailBig: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
};
---

<section id="contact" class="py-24 md:py-32 bg-forest">
  <div class="container mx-auto px-6">
    <div class="max-w-4xl mx-auto text-center">
      <p class="font-body text-ocean-light text-sm tracking-[0.2em] uppercase mb-4">
        Contacto
      </p>
      <h2 class="font-heading text-4xl md:text-5xl lg:text-6xl text-cream mb-6">
        ¿Listo para tu próxima aventura?
      </h2>
      <p class="font-body text-cream/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
        Escríbenos y cuéntanos qué experiencia te gustaría vivir. Te responderemos lo antes posible para organizar tu escapada.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="mailto:hola@waldenadventures.com" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cream text-forest font-body font-medium rounded-full hover:bg-cream/90 transition-all shadow-lg">
          <span set:html={icons.mail} />
          Enviar mensaje
        </a>
        <a href="tel:+34600000000" class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-cream text-cream font-body font-medium rounded-full hover:bg-cream/10 transition-all">
          <span set:html={icons.phone} />
          Llamar ahora
        </a>
      </div>

      <div class="grid sm:grid-cols-3 gap-8 pt-10 border-t border-cream/20">
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-cream/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-ocean-light" set:html={icons.mapPin} />
          </div>
          <p class="font-body text-cream font-medium mb-1">Ubicación</p>
          <p class="font-body text-cream/70 text-sm">Gran Canaria, España</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-cream/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-ocean-light" set:html={icons.mailBig} />
          </div>
          <p class="font-body text-cream font-medium mb-1">Email</p>
          <a href="mailto:hola@waldenadventures.com" class="font-body text-cream/70 text-sm hover:text-cream transition-colors">
            hola@waldenadventures.com
          </a>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-cream/10 flex items-center justify-center mx-auto mb-4">
            <span class="text-ocean-light" set:html={icons.instagram} />
          </div>
          <p class="font-body text-cream font-medium mb-1">Instagram</p>
          <a href="https://instagram.com/waldenadventuresgc" target="_blank" class="font-body text-cream/70 text-sm hover:text-cream transition-colors">
            @waldenadventuresgc
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Footer.astro

```astro
---
const currentYear = new Date().getFullYear();
---

<footer class="py-8 bg-foreground">
  <div class="container mx-auto px-6">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="font-heading text-lg text-cream">Walden Adventures</span>
        <span class="text-xs font-body tracking-widest text-cream/60">GC</span>
      </div>
      <p class="font-body text-sm text-cream/50">
        © {currentYear} Walden Adventures GC. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>
```

---

## 6. Página principal (src/pages/index.astro)

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Experiences from '../components/Experiences.astro';
import Philosophy from '../components/Philosophy.astro';
import Pricing from '../components/Pricing.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Walden Adventures GC | Experiencias al aire libre en Gran Canaria">
  <Header />
  <Hero />
  <Experiences />
  <Philosophy />
  <Pricing />
  <Contact />
  <Footer />
</Layout>
```

---

## 7. Imágenes necesarias

Copia estas imágenes a `src/assets/`:
- hero-kayak.jpg
- hiking.jpg
- kayaking.jpg
- paddlesurf.jpg
- outdoor-dining.jpg

---

## 8. Instalación en Astro

```bash
# Crear proyecto Astro
npm create astro@latest walden-adventures

# Añadir Tailwind
npx astro add tailwind

# Copiar archivos según la estructura
# Añadir las imágenes a src/assets/

# Ejecutar
npm run dev
```

---

¡Listo! Este código es totalmente funcional en Astro con Tailwind CSS.
