import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Upsert categories
  const categories = [
    { name: 'Дизайн', slug: 'design', color: '#8B5CF6', icon: '🎨' },
    { name: 'Розробка', slug: 'development', color: '#3B82F6', icon: '💻' },
    { name: 'Інструменти', slug: 'tools', color: '#10B981', icon: '🔧' },
    { name: 'Маркетинг', slug: 'marketing', color: '#F59E0B', icon: '📈' },
    { name: 'Освіта', slug: 'education', color: '#EF4444', icon: '📚' },
    { name: 'Розваги', slug: 'entertainment', color: '#EC4899', icon: '🎮' },
    { name: 'Бізнес', slug: 'business', color: '#6366F1', icon: '💼' },
    { name: 'Інше', slug: 'other', color: '#6B7280', icon: '📌' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log('✅ Categories seeded')

  // Upsert sites
  const sites = [
    {
      name: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      slug: 'tailwindcss',
      description: 'A utility-first CSS framework for rapidly building custom user interfaces without leaving your HTML.',
      categorySlug: 'development',
      votes: 247,
      featured: false,
    },
    {
      name: 'Figma',
      url: 'https://figma.com',
      slug: 'figma',
      description: 'The collaborative interface design tool. Build better products as a team with Figma.',
      categorySlug: 'design',
      votes: 312,
      featured: true,
    },
    {
      name: 'Dribbble',
      url: 'https://dribbble.com',
      slug: 'dribbble',
      description: 'Discover the world\'s top designers & creatives. Dribbble is where designers gain inspiration.',
      categorySlug: 'design',
      votes: 198,
      featured: false,
    },
    {
      name: 'Vercel',
      url: 'https://vercel.com',
      slug: 'vercel',
      description: 'Develop. Preview. Ship. The platform for frontend developers with the best developer experience.',
      categorySlug: 'development',
      votes: 289,
      featured: true,
    },
    {
      name: 'Notion',
      url: 'https://notion.so',
      slug: 'notion',
      description: 'One workspace. Every team. Write, plan, collaborate, and get organized in one tool.',
      categorySlug: 'tools',
      votes: 156,
      featured: false,
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      slug: 'github',
      description: 'Where the world builds software. GitHub is where over 100 million developers shape the future of software.',
      categorySlug: 'development',
      votes: 334,
      featured: true,
    },
    {
      name: 'Linear',
      url: 'https://linear.app',
      slug: 'linear',
      description: 'The issue tracking tool you\'ll enjoy using. Linear helps streamline software projects, sprints, and bug tracking.',
      categorySlug: 'tools',
      votes: 134,
      featured: false,
    },
    {
      name: 'Framer',
      url: 'https://framer.com',
      slug: 'framer',
      description: 'The professional website builder for creative designers. Build stunning sites with production-ready components.',
      categorySlug: 'design',
      votes: 112,
      featured: false,
    },
    {
      name: 'shadcn/ui',
      url: 'https://ui.shadcn.com',
      slug: 'shadcn-ui',
      description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable.',
      categorySlug: 'development',
      votes: 203,
      featured: false,
    },
    {
      name: 'LottieFiles',
      url: 'https://lottiefiles.com',
      slug: 'lottiefiles',
      description: 'The easiest way to create, edit, test, and display Lottie animations. Free Lottie animation files.',
      categorySlug: 'design',
      votes: 87,
      featured: false,
    },
    {
      name: 'Next.js',
      url: 'https://nextjs.org',
      slug: 'nextjs',
      description: 'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create high-quality web apps.',
      categorySlug: 'development',
      votes: 278,
      featured: false,
    },
    {
      name: 'Supabase',
      url: 'https://supabase.com',
      slug: 'supabase',
      description: 'The open source Firebase alternative. Build production-grade applications with a Postgres database, authentication, and more.',
      categorySlug: 'development',
      votes: 167,
      featured: false,
    },
  ]

  for (const site of sites) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: site.categorySlug },
    })

    await prisma.site.upsert({
      where: { slug: site.slug },
      update: {
        name: site.name,
        url: site.url,
        description: site.description,
        categoryId: category.id,
        voteCount: site.votes,
        featured: site.featured,
      },
      create: {
        name: site.name,
        url: site.url,
        slug: site.slug,
        description: site.description,
        categoryId: category.id,
        voteCount: site.votes,
        featured: site.featured,
      },
    })
  }

  console.log('✅ Sites seeded')
  console.log('🎉 Seed completed successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
