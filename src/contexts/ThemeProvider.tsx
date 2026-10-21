import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeContext, ThemeSettings, defaultTheme } from './theme-context';

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .eq('category', 'visual')
          .eq('scope', 'public');

        if (data && data.length > 0) {
          const newTheme = { ...defaultTheme };
          data.forEach((s) => {
            const val = s.value as string;
            switch (s.key) {
              case 'logo_url': if (val) newTheme.logoUrl = val; break;
              case 'favicon_url': if (val) newTheme.faviconUrl = val; break;
              case 'primary_color': if (val) newTheme.primaryColor = val; break;
              case 'secondary_color': if (val) newTheme.secondaryColor = val; break;
              case 'accent_color': if (val) newTheme.accentColor = val; break;
              case 'font_family': if (val) newTheme.fontFamily = val; break;
              case 'border_radius': if (val) newTheme.borderRadius = val; break;
            }
          });
          setTheme(newTheme);
        }
      } catch (err) {
        console.error('Error fetching theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex colors to HSL for Tailwind compatibility
    const primary = hexToHSL(theme.primaryColor);
    const secondary = hexToHSL(theme.secondaryColor);
    const accent = hexToHSL(theme.accentColor);
    
    root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
    root.style.setProperty('--secondary', `${secondary.h} ${secondary.s}% ${secondary.l}%`);
    root.style.setProperty('--accent', `${accent.h} ${accent.s}% ${accent.l}%`);
    root.style.setProperty('--radius', `${theme.borderRadius}px`);
    
    // Update favicon if provided
    if (theme.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = theme.faviconUrl;
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}
