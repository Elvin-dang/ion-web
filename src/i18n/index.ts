/**
 * i18n setup (react-i18next). Default + fallback language is English.
 *
 * FEATURE AGENTS: add your keys to the `en` resource bundle below (or merge a
 * per-feature namespace via i18n.addResourceBundle). Keep keys namespaced by
 * feature, e.g. `workOrders.title`.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const defaultLng = 'en';

const en = {
  translation: {
    app: {
      name: 'I-ON',
      brand: 'EZAxis',
      tagline: 'Smarter Facility & Maintenance Management',
    },
    common: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      getStarted: 'Get Started',
      goToDashboard: 'Go to Dashboard',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      search: 'Search',
    },
    nav: {
      dashboard: 'Dashboard',
    },
    roles: {
      super_admin: 'Super Admin',
      tenant: 'Tenant',
      building_manager: 'Building Manager',
      msp_supervisor: 'MSP Supervisor',
    },
  },
};

void i18n.use(initReactI18next).init({
  resources: { en },
  lng: defaultLng,
  fallbackLng: defaultLng,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
