// simulador.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Configuração do Firebase (substitua pelos seus dados se necessário)
const firebaseConfig = {
  apiKey: "AIzaSyBW_7oWIiyXWsiUkqkQXgVidmCEtzGtFPY",
  authDomain: "frequencode.firebaseapp.com",
  projectId: 'frequencode',
  storageBucket: 'frequencode.appspot.com',
  messagingSenderId: '244211040015',
  appId: '1:244211040015:web:223d78030ff878feb2487a',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const turmas = ['3AA', '3AB', '3AC', '3AD'];
const nomes = [
  'Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana',
  'Kleber', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Quésia', 'Rafael', 'Sabrina', 'Tiago',
  'Ursula', 'Vinícius', 'Wesley', 'Xuxa', 'Yasmin', 'Zeca', 'Beatriz', 'Caio', 'Diana', 'Enzo'
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDiasLetivos(start: Date, end: Date) {
  const days = [];
  let d = new Date(start);
  while (d <= end) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

async function criarTurmas() {
  for (const turma of turmas) {
    await setDoc(doc(db, 'classes', turma), {
      id: turma,
      name: turma,
      code: turma,
      year: 2024,
      semester: 1,
      teacherId: 'admin',
      students: [],
      schedule: {
        startTime: '07:30',
        endTime: '12:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    });
  }
}

async function criarAlunos() {
  const alunos = [];
  for (let i = 0; i < 30; i++) {
    const turma = turmas[i % turmas.length];
    const nome = nomes[i];
    const id = uuidv4();
    const email = `${nome.toLowerCase()}@exemplo.com`;
    const aluno = {
      id,
      email,
      name: nome + ' da Silva',
      role: 'student',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      profile: {
        avatar: null,
        phone: null,
        address: null,
        classId: turma,
      },
    };
    await setDoc(doc(db, 'users', id), aluno);
    alunos.push({ ...aluno, turma });
  }
  return alunos;
}

async function criarCheckins(alunos: any[], startSchoolYear: Date) {
  const hoje = new Date();
  const diasLetivos = getDiasLetivos(startSchoolYear, hoje);
  for (const aluno of alunos) {
    for (const dia of diasLetivos) {
      // Simula presença (80%), atraso (10%), falta (10%)
      const sorteio = getRandomInt(1, 100);
      let status = 'present';
      if (sorteio > 90) status = 'absent';
      else if (sorteio > 80) status = 'late';
      const checkin = {
        id: uuidv4(),
        userId: aluno.id,
        classId: aluno.profile.classId,
        userName: aluno.name,
        date: Timestamp.fromDate(new Date(dia)),
        status,
        location: {
          latitude: -3.119027 + Math.random() * 0.01,
          longitude: -60.014179 + Math.random() * 0.01,
          accuracy: 10,
        },
        deviceInfo: {
          platform: 'simulator',
          version: '1.0',
          deviceId: 'simulator',
        },
        createdAt: Timestamp.fromDate(new Date(dia)),
        updatedAt: Timestamp.fromDate(new Date(dia)),
        metadata: {
          justification: null,
          notes: null,
        },
      };
      await setDoc(doc(db, 'checkins', checkin.id), checkin);
    }
  }
}

async function main() {
  console.log('Criando turmas...');
  await criarTurmas();
  console.log('Criando alunos...');
  const alunos = await criarAlunos();
  console.log('Criando check-ins simulados...');
  // Início do ano letivo: 01/02/2024
  const startSchoolYear = new Date(2024, 1, 1);
  await criarCheckins(alunos, startSchoolYear);
  console.log('População do banco de dados simulada concluída!');
}

main(); 