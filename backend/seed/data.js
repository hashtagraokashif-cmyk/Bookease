/**
 * Demo content: the four providers that were already shown in the frontend,
 * now stored in MongoDB. Each provider gets a login so they can manage their
 * own appointments from the provider dashboard.
 */

export const PROVIDER_PASSWORD = "Provider@123";
export const CUSTOMER_PASSWORD = "Customer@123";

export const demoCustomer = {
  name: "Demo Customer",
  email: "customer@bookease.test",
  phone: "03001234567",
};

export const providers = [
  {
    name: "Dr. Ahmed Khan",
    category: "Doctor",
    bio: "Experienced healthcare professional providing reliable consultation services with a patient-focused approach.",
    location: "Islamabad",
    phone: "+92 300 1234567",
    email: "ahmed@bookease.test",
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: "09:00", end: "17:00" },
    breakTime: { start: "13:00", end: "14:00" },
    services: [
      {
        name: "General Consultation",
        description: "Professional consultation for general health concerns and medical guidance.",
        duration: 30,
        price: 1500,
      },
      {
        name: "Follow-up Consultation",
        description: "Follow-up consultation to review progress and discuss ongoing concerns.",
        duration: 20,
        price: 1000,
      },
    ],
  },
  {
    name: "Sarah Ahmed",
    category: "Consultant",
    bio: "Business consultant helping founders and professionals plan growth, strategy and career moves.",
    location: "Lahore",
    phone: "+92 321 5551234",
    email: "sarah@bookease.test",
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: "10:00", end: "18:00" },
    breakTime: { start: "13:00", end: "14:00" },
    services: [
      {
        name: "Business Consultation",
        description: "One-on-one consultation to discuss business planning and professional growth.",
        duration: 45,
        price: 2500,
      },
      {
        name: "Career Coaching",
        description: "A focused session on your CV, interviews and next career step.",
        duration: 30,
        price: 1800,
      },
    ],
  },
  {
    name: "Style Studio",
    category: "Salon",
    bio: "Modern salon offering professional hair styling and grooming with experienced stylists.",
    location: "Islamabad",
    phone: "+92 333 5550000",
    email: "stylestudio@bookease.test",
    workingDays: [0, 2, 3, 4, 5, 6],
    workingHours: { start: "10:00", end: "19:00" },
    breakTime: { start: "14:00", end: "15:00" },
    services: [
      {
        name: "Hair Styling",
        description: "Professional hair styling service with an experienced stylist.",
        duration: 60,
        price: 2000,
      },
      {
        name: "Haircut",
        description: "A classic cut and finish, tailored to your hair type.",
        duration: 30,
        price: 1000,
      },
    ],
  },
  {
    name: "Ali Legal Consultants",
    category: "Lawyer",
    bio: "Legal advice for personal, property and business matters from experienced advocates.",
    location: "Rawalpindi",
    phone: "+92 345 5559876",
    email: "ali@bookease.test",
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: "09:00", end: "17:00" },
    breakTime: { start: "13:00", end: "14:00" },
    services: [
      {
        name: "Legal Consultation",
        description: "Professional legal consultation for personal and business matters.",
        duration: 45,
        price: 3000,
      },
      {
        name: "Document Review",
        description: "Review of contracts, agreements or property papers before you sign.",
        duration: 30,
        price: 2000,
      },
    ],
  },
];
