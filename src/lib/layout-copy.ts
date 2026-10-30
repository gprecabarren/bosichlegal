export const layoutCopyDefaults = {
  navHome: "Inicio", navServices: "Servicios", navProperties: "Propiedades", navNews: "Noticias", navLocation: "Ubicación", navAbout: "Sobre nosotros", navContact: "Contacto",
  footerContact: "Contacto", footerOffices: "Oficinas", footerNavigation: "Navegación", footerWhatsapp: "WhatsApp directo", footerServices: "Servicios jurídicos", footerProperties: "Propiedades en venta", footerAbout: "Sobre nosotros", footerLocation: "Ubicación", footerContactLink: "Contacto",
};
export const layoutCopyLabels: Record<keyof typeof layoutCopyDefaults, string> = {
  navHome: "Menú: inicio", navServices: "Menú: servicios", navProperties: "Menú: propiedades", navNews: "Menú: noticias", navLocation: "Menú: ubicación", navAbout: "Menú: sobre nosotros", navContact: "Menú: contacto",
  footerContact: "Pie: título contacto", footerOffices: "Pie: título oficinas", footerNavigation: "Pie: título navegación", footerWhatsapp: "Pie: enlace WhatsApp", footerServices: "Pie: enlace servicios", footerProperties: "Pie: enlace propiedades", footerAbout: "Pie: enlace sobre nosotros", footerLocation: "Pie: enlace ubicación", footerContactLink: "Pie: enlace contacto",
};
export function layoutCopy(overrides?: Partial<Record<keyof typeof layoutCopyDefaults, string>>) { return { ...layoutCopyDefaults, ...overrides }; }
