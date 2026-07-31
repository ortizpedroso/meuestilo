import { Service, Professional, Appointment, Review, SalonSettings } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Corte Masculino',
    description: 'Corte moderno ou clássico com tesoura e máquina, finalização com pomada e lavagem relaxante.',
    durationMinutes: 30,
    price: 45,
    category: 'Cabelo',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-2',
    name: 'Corte Feminino',
    description: 'Design de corte personalizado com visagismo, lavagem especial, hidratação rápida e secagem.',
    durationMinutes: 50,
    price: 90,
    category: 'Cabelo',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-3',
    name: 'Escova Modeladora',
    description: 'Lavagem com xampu de nutrição profunda e escovação com acabamento liso ou ondulado.',
    durationMinutes: 40,
    price: 60,
    category: 'Cabelo',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-4',
    name: 'Progressiva Orgânica',
    description: 'Alinhamento capilar sem formol, reduz o volume, elimina o frizz e proporciona brilho intenso.',
    durationMinutes: 120,
    price: 180,
    category: 'Tratamentos',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-5',
    name: 'Barba com Toalha Quente',
    description: 'Modelagem completa de barba com alinhamento na navalha, produtos hidratantes e toalha aquecida.',
    durationMinutes: 25,
    price: 35,
    category: 'Barba',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-6',
    name: 'Manicure Completa',
    description: 'Cutilagem delicada, lixamento, formato desejado, massagem relaxante nas mãos e esmaltação.',
    durationMinutes: 40,
    price: 35,
    category: 'Estética & Unhas',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'srv-7',
    name: 'Pedicure Completa',
    description: 'Higienização dos pés, esfoliação renovadora, cutilagem, lixamento e esmaltação duradoura.',
    durationMinutes: 45,
    price: 40,
    category: 'Estética & Unhas',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=400'
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Gabriel Alves',
    role: 'Especialista em Cortes & Barba',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: 'Mais de 8 anos de experiência em cortes masculinos modernos, barboterapia e visagismo.',
    rating: 4.9,
    specialties: ['srv-1', 'srv-5'],
    workingDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
    startTime: '08:00',
    endTime: '19:00'
  },
  {
    id: 'prof-2',
    name: 'Camila Rocha',
    role: 'Hairstylist & Especialista em Tratamentos',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    bio: 'Especialista em mechas, cortes femininos modernos e alinhamentos capilares orgânicos.',
    rating: 5.0,
    specialties: ['srv-2', 'srv-3', 'srv-4'],
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '08:30',
    endTime: '18:30'
  },
  {
    id: 'prof-3',
    name: 'Lucas Ferreira',
    role: 'Nail Designer & Estética',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bio: 'Especialista em cuidados corporais, manicure, pedicure e esmaltação em gel com acabamento impecável.',
    rating: 4.8,
    specialties: ['srv-6', 'srv-7'],
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '19:00'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    clientName: 'Mariana Souza',
    rating: 5,
    comment: 'A Camila é incrível! Minha progressiva ficou sensacional, super brilhante e soltinha. Atendimento nota 1000!',
    date: '2026-07-28',
    serviceName: 'Progressiva Orgânica',
    professionalName: 'Camila Rocha',
    verifiedBooking: true
  },
  {
    id: 'rev-2',
    clientName: 'Thiago Martins',
    rating: 5,
    comment: 'O Gabriel manja demais do degradê e a barboterapia com toalha quente é relaxante demais. Recomendo muito!',
    date: '2026-07-25',
    serviceName: 'Barba com Toalha Quente',
    professionalName: 'Gabriel Alves',
    verifiedBooking: true
  },
  {
    id: 'rev-3',
    clientName: 'Beatriz Lima',
    rating: 5,
    comment: 'Ambiente super aconchegante, café maravilhoso e o agendamento pelo site facilitou demais minha rotina.',
    date: '2026-07-20',
    serviceName: 'Manicure Completa',
    professionalName: 'Lucas Ferreira',
    verifiedBooking: true
  },
  {
    id: 'rev-4',
    clientName: 'Rodrigo Alves',
    rating: 4,
    comment: 'Pontualidade no atendimento e agilidade no agendamento. Voltarei mais vezes!',
    date: '2026-07-15',
    serviceName: 'Corte Masculino',
    professionalName: 'Gabriel Alves',
    verifiedBooking: true
  }
];

// Helper to get today's date in YYYY-MM-DD
const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    code: 'STILO-9812',
    serviceId: 'srv-1',
    serviceName: 'Corte Masculino',
    servicePrice: 45,
    serviceDuration: 30,
    professionalId: 'prof-1',
    professionalName: 'Gabriel Alves',
    date: getTodayString(0),
    time: '09:00',
    clientName: 'Carlos Eduardo',
    clientPhone: '(11) 98765-4321',
    clientEmail: 'carlos.eduardo@email.com',
    notes: 'Preferência por degradê baixo.',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-2',
    code: 'STILO-4421',
    serviceId: 'srv-2',
    serviceName: 'Corte Feminino',
    servicePrice: 90,
    serviceDuration: 50,
    professionalId: 'prof-2',
    professionalName: 'Camila Rocha',
    date: getTodayString(0),
    time: '10:30',
    clientName: 'Fernanda Oliveira',
    clientPhone: '(11) 97123-8899',
    clientEmail: 'fe.oliveira@email.com',
    notes: 'Apenas tirar as pontinhas.',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-3',
    code: 'STILO-1029',
    serviceId: 'srv-6',
    serviceName: 'Manicure Completa',
    servicePrice: 35,
    serviceDuration: 40,
    professionalId: 'prof-3',
    professionalName: 'Lucas Ferreira',
    date: getTodayString(0),
    time: '14:00',
    clientName: 'Juliana Paes',
    clientPhone: '(11) 99887-1122',
    clientEmail: 'juliana.paes@email.com',
    notes: 'Esmalte vermelho clássico.',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-4',
    code: 'STILO-7712',
    serviceId: 'srv-5',
    serviceName: 'Barba com Toalha Quente',
    servicePrice: 35,
    serviceDuration: 25,
    professionalId: 'prof-1',
    professionalName: 'Gabriel Alves',
    date: getTodayString(1), // Amanhã
    time: '11:00',
    clientName: 'Lucas Mendes',
    clientPhone: '(11) 98111-2233',
    clientEmail: 'lucas.mendes@email.com',
    notes: '',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SALON_SETTINGS: SalonSettings = {
  name: 'Meu Stilo',
  tagline: 'Salão de Beleza & Barbearia Premium',
  logoUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=200',
  bannerUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
  phone: '11988887777', // WhatsApp sem formatação
  address: 'Av. Paulista, 1500 - Bela Vista',
  city: 'São Paulo - SP',
  instagram: '@meustilobeauty',
  pixKey: 'contato@meustilosalao.com.br',
  workingHours: {
    slotIntervalMinutes: 30,
    workDays: [
      { dayOfWeek: 0, dayName: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '14:00' },
      { dayOfWeek: 1, dayName: 'Segunda-feira', isOpen: true, openTime: '08:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 2, dayName: 'Terça-feira', isOpen: true, openTime: '08:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 3, dayName: 'Quarta-feira', isOpen: true, openTime: '08:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 4, dayName: 'Quinta-feira', isOpen: true, openTime: '08:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 5, dayName: 'Sexta-feira', isOpen: true, openTime: '08:00', closeTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, openTime: '08:00', closeTime: '20:00', lunchStart: '12:00', lunchEnd: '13:00' }
    ]
  },
  subscriptionPlan: {
    name: 'Plano Pro Enterprise',
    status: 'active',
    priceMonthly: 89.90,
    nextBillingDate: '2026-08-30'
  }
};
