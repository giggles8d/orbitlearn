import { PrismaClient, QuestionType } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // Organization
  const org = await db.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      slug: 'default',
      name: 'Default Org'
    }
  })

  // Sample Course: GD&T Essentials
  const course = await db.course.upsert({
    where: { slug: 'gdt-essentials' },
    update: {},
    create: {
      orgId: org.id,
      slug: 'gdt-essentials',
      title: 'GD&T Essentials',
      subtitle: 'Geometric Dimensioning & Tolerancing for real-world design',
      description: 'A practical, example-driven introduction to GD&T symbols, datums, and tolerances.',
      category: 'Engineering',
      status: 'PUBLISHED',
      price: 0
    }
  })

  const mod1 = await db.module.create({
    data: { courseId: course.id, index: 1, title: 'Foundations', description: 'Why GD&T, drawings vs models, standards' }
  })
  const lesson1 = await db.lesson.create({
    data: {
      moduleId: mod1.id, index: 1, title: 'What is GD&T?',
      content: `# What is GD&T?

GD&T stands for **Geometric Dimensioning and Tolerancing**. It provides a precise, standardized way to define part geometry, allowable variation, and inspection expectations.

**You will learn:** purpose of GD&T, benefits over +/- dimensions, and where it comes from (ASME Y14.5).

> Quick example: using position tolerance instead of tight linear dims can *increase manufacturability* while preserving functional fit.`,
      freePreview: true
    }
  })

  // Add a quiz
  const quiz1 = await db.quiz.create({ data: { lessonId: lesson1.id } })
  const q1 = await db.question.create({
    data: { quizId: quiz1.id, index: 1, type: QuestionType.SINGLE_CHOICE, prompt: 'GD&T primarily helps with…' }
  })
  await db.option.createMany({
    data: [
      { questionId: q1.id, text: 'Specifying material properties', correct: false },
      { questionId: q1.id, text: 'Communicating acceptable geometric variation', correct: true },
      { questionId: q1.id, text: 'Rendering photorealistic models', correct: false }
    ]
  })

  const mod2 = await db.module.create({
    data: { courseId: course.id, index: 2, title: 'Symbols & Datums', description: 'Common feature control frames' }
  })
  await db.lesson.create({
    data: {
      moduleId: mod2.id, index: 1, title: 'Datum Features',
      content: `## Datum features

A **datum feature** is a real surface used to establish a datum. Datums provide a reference frame for measurement and assembly.`
    }
  })

  // Feature flags example
  await db.featureFlag.upsert({
    where: { organizationId_key: { organizationId: org.id, key: 'player.spacedReview' } },
    update: { enabled: true, value: 'alpha' },
    create: { organizationId: org.id, key: 'player.spacedReview', value: 'alpha', enabled: true }
  })

  console.log('Seeded successfully.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await db.$disconnect()
})
