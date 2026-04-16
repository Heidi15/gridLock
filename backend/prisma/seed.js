const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Script de seed idempotent — peut être relancé sans créer de doublons.
 * Ordre d'insertion contraint par les FK : User → Student → Event → Participation
 */
async function main() {
  console.log('🌱 Démarrage du seed GridLock...');

  // ─── Étudiants de démo ─────────────────────────────────────────────────────
  const enzo = await prisma.student.upsert({
    where: { email: 'enzo.martin@edu.esiee-it.fr' },
    update: {},
    create: {
      nom: 'MARTIN',
      prenom: 'Enzo',
      email: 'enzo.martin@edu.esiee-it.fr',
      telephone: '0612345678',
      formation: 'Coding Cergy - DSNS - B3',
      annee: '3ème année',
      etabOrigine: 'Lycée Saint-Martin de France',
    },
  });

  const lea = await prisma.student.upsert({
    where: { email: 'lea.dupont@edu.esiee-it.fr' },
    update: {},
    create: {
      nom: 'DUPONT',
      prenom: 'Léa',
      email: 'lea.dupont@edu.esiee-it.fr',
      formation: 'Cybersécurité - B2',
      annee: '2ème année',
    },
  });

  const maxence = await prisma.student.upsert({
    where: { email: 'maxence.villard@edu.esiee-it.fr' },
    update: {},
    create: {
      nom: 'VILLARD',
      prenom: 'Maxence',
      email: 'maxence.villard@edu.esiee-it.fr',
      formation: 'Cybersécurité B3',
      annee: '3ème année',
    },
  });

  const yasmine = await prisma.student.upsert({
    where: { email: 'yasmine.ouali@edu.esiee-it.fr' },
    update: {},
    create: {
      nom: 'OUALI',
      prenom: 'Yasmine',
      email: 'yasmine.ouali@edu.esiee-it.fr',
      formation: 'Marketing B1',
      annee: '1ère année',
    },
  });

  console.log('✅ Étudiants créés');

  // ─── Comptes utilisateurs de démo ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const directorHash = await bcrypt.hash('Director1!', 12);
  const studentHash = await bcrypt.hash('Student1!', 12);

  const sophie = await prisma.user.upsert({
    where: { email: 'sophie@esiee-it.fr' },
    update: {},
    create: {
      email: 'sophie@esiee-it.fr',
      passwordHash,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'marc@esiee-it.fr' },
    update: {},
    create: {
      email: 'marc@esiee-it.fr',
      passwordHash: directorHash,
      role: 'director',
    },
  });

  await prisma.user.upsert({
    where: { email: 'enzo.martin@edu.esiee-it.fr' },
    update: {},
    create: {
      email: 'enzo.martin@edu.esiee-it.fr',
      passwordHash: studentHash,
      role: 'student',
      studentId: enzo.id,
    },
  });

  console.log('✅ Utilisateurs créés');

  // ─── Événements de démo ────────────────────────────────────────────────────
  const jpoAutomne = await prisma.event.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      mois: 'Octobre',
      type: 'JPO',
      dateEvent: new Date('2025-10-14'),
      nomStructure: 'ESIEE-IT Pontoise',
      nomEvenement: 'JPO Automne Pontoise',
      ville: 'Pontoise',
      horaires: '10h - 17h',
      besoins: '4 étudiants ambassadeurs toutes formations',
      createdBy: sophie.id,
    },
  });

  const forumOrientation = await prisma.event.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      mois: 'Novembre',
      type: 'Forum',
      dateEvent: new Date('2025-11-22'),
      nomStructure: 'Lycée Camille Pissarro',
      nomEvenement: 'Forum Orientation',
      ville: 'Pontoise',
      horaires: '9h - 12h',
      besoins: '2 étudiants Coding',
      createdBy: sophie.id,
    },
  });

  const salonStudyrama = await prisma.event.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      mois: 'Janvier',
      type: 'Salon',
      dateEvent: new Date('2026-01-18'),
      nomStructure: 'Paris Expo Porte de Versailles',
      nomEvenement: 'Salon Studyrama',
      ville: 'Paris 15e',
      horaires: '10h - 18h',
      besoins: '3 étudiants dont 1 Cybersécurité',
      createdBy: sophie.id,
    },
  });

  const jpoPrintemps = await prisma.event.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      mois: 'Mars',
      type: 'JPO',
      dateEvent: new Date('2026-03-07'),
      nomStructure: 'ESIEE-IT Cergy',
      nomEvenement: 'JPO Printemps Cergy',
      ville: 'Cergy',
      horaires: '10h - 17h',
      besoins: '5 étudiants ambassadeurs',
      createdBy: sophie.id,
    },
  });

  const salonEtudiant = await prisma.event.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      mois: 'Avril',
      type: 'Salon',
      dateEvent: new Date('2026-04-12'),
      nomStructure: 'Parc Floral',
      nomEvenement: "Salon de l'Étudiant",
      ville: 'Paris 12e',
      horaires: '10h - 18h',
      besoins: '4 étudiants toutes formations',
      createdBy: sophie.id,
    },
  });

  console.log('✅ Événements créés');

  // ─── Participations de démo ────────────────────────────────────────────────
  // Enzo : présent JPO Automne (ambassadeur), confirmé Forum, absent Studyrama
  await prisma.participation.upsert({
    where: { eventId_studentId: { eventId: jpoAutomne.id, studentId: enzo.id } },
    update: {},
    create: {
      eventId: jpoAutomne.id,
      studentId: enzo.id,
      statut: 'present',
      estAmbassadeur: true,
      confirmePar: sophie.id,
    },
  });

  await prisma.participation.upsert({
    where: { eventId_studentId: { eventId: forumOrientation.id, studentId: enzo.id } },
    update: {},
    create: {
      eventId: forumOrientation.id,
      studentId: enzo.id,
      statut: 'confirme',
    },
  });

  await prisma.participation.upsert({
    where: { eventId_studentId: { eventId: salonStudyrama.id, studentId: enzo.id } },
    update: {},
    create: {
      eventId: salonStudyrama.id,
      studentId: enzo.id,
      statut: 'absent',
    },
  });

  // Léa : confirmée JPO Printemps
  await prisma.participation.upsert({
    where: { eventId_studentId: { eventId: jpoPrintemps.id, studentId: lea.id } },
    update: {},
    create: {
      eventId: jpoPrintemps.id,
      studentId: lea.id,
      statut: 'confirme',
    },
  });

  // Maxence : présent à 4 événements (valide les compteurs KPI)
  for (const event of [jpoAutomne, forumOrientation, jpoPrintemps, salonEtudiant]) {
    await prisma.participation.upsert({
      where: { eventId_studentId: { eventId: event.id, studentId: maxence.id } },
      update: {},
      create: {
        eventId: event.id,
        studentId: maxence.id,
        statut: 'present',
        estAmbassadeur: event.id === jpoPrintemps.id,
      },
    });
  }

  // Yasmine : aucune participation (valide l'état vide)

  console.log('✅ Participations créées');
  console.log('🎉 Seed terminé avec succès !');
  console.log('');
  console.log('Comptes de démo :');
  console.log('  Admin     : sophie@esiee-it.fr      / Admin123!');
  console.log('  Director  : marc@esiee-it.fr         / Director1!');
  console.log('  Étudiant  : enzo.martin@edu.esiee-it.fr / Student1!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
