# Graph Report - C:\Users\Cesar Barrero\Documents\proyectos\viptelcomunicaciones  (2026-08-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1961 nodes · 3505 edges · 187 communities (150 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b242345d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/payload-types.ts
- i18n/index.ts
- Header.astro
- compilerOptions
- subcategories
- lib/payload-types.ts
- opencode.json
- blog.ts
- CTA/CTA.astro
- projects.ts
- cn.ts
- Toast.tsx
- ContactView.astro
- payload-client.ts
- PayloadClient
- Pages/index.ts
- t
- Icon.astro
- devDependencies
- cn
- devDependencies
- og.ts
- site.config.ts
- payload.config.ts
- BlogLayout.astro
- Hero.astro
- AvatarGroup.tsx
- favicon/index.ts
- components
- utilities
- dependencies
- keywords
- link.ts
- components
- properties
- name
- types.ts
- ConsentBanner.astro
- scripts
- importMap.js
- website/package.json
- authenticated.ts
- renderFaviconPng
- component-registry.schema.json
- scripts
- FeatureTabs.tsx
- contact.ts
- not-found.tsx
- Posts/index.ts
- card
- toast
- button
- checkbox
- radio
- select
- switch
- textarea
- Button.tsx
- scripts
- required
- avatar
- badge
- pagination
- progress
- skeleton
- alert
- input
- accordion
- vertical-tabs
- Pagination/Pagination.astro
- Alert.astro
- Input.astro
- Accordion.tsx
- dependencies
- backend/package.json
- page.tsx
- code-block
- avatar-group
- table
- tooltip
- separator
- cta
- logo
- npm-copy-button
- social-proof
- terminal-demo
- dialog
- dropdown
- tabs
- icon
- properties
- files
- Progress/index.ts
- Textarea.astro
- content.config.ts
- gallery.ts
- 20260801_232755_initial.ts
- generatePreviewPath.ts
- seed.ts
- admin.e2e.spec.ts
- footer
- header
- utilities
- ProofTile.astro
- Skeleton.astro
- Radio/index.ts
- Switch/index.ts
- [...slug]/route.ts
- plugins/index.ts
- form-field
- search-input
- stat-card
- GoogleMap.astro
- overlay/index.ts
- Badge.tsx
- TerminalDemo.tsx
- eslint.config.mjs
- .prettierrc.json
- Analytics.astro
- ShareButtons.astro
- LetterGlitch.tsx
- []
- Dialog.astro
- Dialog.tsx
- tailwind-merge
- version
- RedirectQueries
- astro-env-server.ts
- react-dom
- eslint
- @types/react
- @types/react-dom
- environment.d.ts
- MediaBlockRenderer.astro
- @astrojs/mdx
- @astrojs/netlify
- @astrojs/node
- @astrojs/react
- @astrojs/sitemap
- Separator/index.ts
- next
- payload
- @payloadcms/db-postgres
- @payloadcms/next
- @payloadcms/plugin-mcp
- @payloadcms/plugin-nested-docs
- @payloadcms/ui
- react
- sharp
- class-variance-authority
- clsx
- fontkit
- @fontsource-variable/jetbrains-mono
- @fontsource-variable/manrope
- @fontsource-variable/outfit
- @iconify-json/lucide
- @iconify-json/simple-icons
- lucide-react
- png-to-ico
- resend
- react
- schema-dts
- sharp
- ContentBlock.astro
- contact.test.ts
- newsletter.test.ts
- required
- dotenv

## God Nodes (most connected - your core abstractions)
1. `cn()` - 96 edges
2. `components` - 48 edges
3. `t()` - 46 edges
4. `components` - 42 edges
5. `utilities` - 42 edges
6. `defaultLocale` - 36 edges
7. `payload` - 30 edges
8. `localizedPath()` - 28 edges
9. `getLocaleFromPath()` - 21 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ignore` --extends--> `node_modules`  [EXTRACTED]
  .opencode/opencode.json → backend/tsconfig.json
- `exclude` --extends--> `node_modules`  [EXTRACTED]
  website/tsconfig.json → backend/tsconfig.json
- `generateURL()` --calls--> `getFrontendURL()`  [EXTRACTED]
  backend/src/plugins/index.ts → backend/src/utilities/getURL.ts
- `t()` --calls--> `localizedPath()`  [EXTRACTED]
  website/src/components/layout/Header.astro → website/src/i18n/index.ts
- `t()` --calls--> `cn()`  [EXTRACTED]
  website/src/components/layout/Header.astro → website/src/lib/cn.ts

## Import Cycles
- None detected.

## Communities (187 total, 37 thin omitted)

### Community 0 - "src/payload-types.ts"
Cohesion: 0.04
Nodes (54): ArchiveBlock, ArchiveBlockSelect, Auth, BannerBlock, CallToActionBlock, CallToActionBlockSelect, CategoriesSelect, Category (+46 more)

### Community 1 - "i18n/index.ts"
Cohesion: 0.07
Nodes (34): hideLabel, items, locale, showLabel, currentLanguageLabel, currentLocale, enabled, triggerLabel (+26 more)

### Community 2 - "Header.astro"
Cohesion: 0.07
Nodes (31): FooterColumnGridVariants, FooterVariants, t(), HeaderInnerVariants, HeaderVariants, locale, modeNames, triggerLabel (+23 more)

### Community 3 - "compilerOptions"
Cohesion: 0.04
Nodes (44): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+36 more)

### Community 4 - "subcategories"
Cohesion: 0.05
Nodes (44): src/components/hero/Hero.astro, src/components/hero/hero.variants.ts, src/components/hero/index.ts, categories, hero, layout, patterns, ui (+36 more)

### Community 5 - "lib/payload-types.ts"
Cohesion: 0.05
Nodes (43): ArchiveBlock, ArchiveBlockSelect, Auth, BannerBlock, CallToActionBlock, CallToActionBlockSelect, CategoriesSelect, Category (+35 more)

### Community 6 - "opencode.json"
Cohesion: 0.05
Nodes (42): description, instructions, model, tools, agent, academico, build, description (+34 more)

### Community 7 - "blog.ts"
Cohesion: 0.11
Nodes (25): cleanUid, regularPosts, socialLinks, topTags, totalPages, pagePosts, socialLinks, topTags (+17 more)

### Community 8 - "CTA/CTA.astro"
Cohesion: 0.09
Nodes (10): Tooltip(), TooltipProps, hasActionsSlot, hasDescriptionSlot, hasHeadingSlot, hasLogoSlot, maxWidths, sectionStyles (+2 more)

### Community 9 - "projects.ts"
Cohesion: 0.11
Nodes (22): title(), aboutUrl, contactUrl, pageProjects, topTags, totalPages, aboutUrl, contactUrl (+14 more)

### Community 10 - "cn.ts"
Cohesion: 0.10
Nodes (11): fieldId, trendColors, trendIcons, locale, selectStyles, sizes, formatDate(), generateId() (+3 more)

### Community 11 - "Toast.tsx"
Cohesion: 0.09
Nodes (21): icons, Toast, ToastContext, ToastContextValue, ToastItem(), ToastProvider(), ToastVariant, useToast() (+13 more)

### Community 12 - "ContactView.astro"
Cohesion: 0.09
Nodes (12): slides, contactUrl, heroTitle, heroTitle, socialLinks, viptelStack, CardsBlock, FAQBlock (+4 more)

### Community 13 - "payload-client.ts"
Cohesion: 0.10
Nodes (21): escapeHtml(), renderBlock(), renderChildren(), renderNode(), resolveLinkUrl(), wrapFormat(), relatedPosts, DocsResponse (+13 more)

### Community 14 - "PayloadClient"
Cohesion: 0.07
Nodes (7): PageQueries, PayloadClient, PostQueries, ProjectQueries, QueryBase, ServiceQueries, Project

### Community 15 - "Pages/index.ts"
Cohesion: 0.15
Nodes (15): authenticatedOrPublished(), Archive, CallToAction, Cards, columnFields, Content, FAQ, Form (+7 more)

### Community 16 - "t"
Cohesion: 0.15
Nodes (13): cardStyles, t(), PageHero, payload, locale, recoveryLinks, recoveryLinks, prerender (+5 more)

### Community 17 - "Icon.astro"
Cohesion: 0.10
Nodes (8): [], locale, servicesPath, classes, isSimpleIcon, string, Service, prerender

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (25): @astrojs/check, @eslint/js, eslint-plugin-astro, globals, prettier-plugin-astro, prettier-plugin-tailwindcss, @tailwindcss/vite, typescript-eslint (+17 more)

### Community 19 - "cn"
Cohesion: 0.16
Nodes (19): Card(), CardByline(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardProps, CardShadow (+11 more)

### Community 20 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, eslint-config-next, jsdom, @playwright/test, prettier, @testing-library/react, tsx, @types/node (+15 more)

### Community 21 - "og.ts"
Cohesion: 0.15
Nodes (11): collectTags(), escapeXml(), getBlogOgPath(), OgImageOptions, renderOgSvg(), truncate(), wrapText(), GET() (+3 more)

### Community 22 - "site.config.ts"
Cohesion: 0.13
Nodes (9): commentsTitle, isConfigured, locale, commentsTitle, locale, commentsTitle, locale, I18nConfig (+1 more)

### Community 23 - "payload.config.ts"
Cohesion: 0.12
Nodes (9): GET, OPTIONS, POST, Pages, defaultLexical, Footer, dirname, filename (+1 more)

### Community 24 - "BlogLayout.astro"
Cohesion: 0.18
Nodes (9): schema, schemaItems, createBlogPostSchema(), createBreadcrumbSchema(), createFAQSchema(), createOrganizationSchema(), createPersonSchema(), createProfessionalServiceSchema() (+1 more)

### Community 25 - "Hero.astro"
Cohesion: 0.12
Nodes (14): classes, classes, contentClasses, gridClasses, hasActionsSlot, hasAsideSlot, hasBadgeSlot, hasBottomSlot (+6 more)

### Community 26 - "AvatarGroup.tsx"
Cohesion: 0.21
Nodes (10): Avatar(), AvatarProps, AvatarVariants, overflowSizes, AvatarGroup(), AvatarGroupProps, AvatarItem, overflowCount (+2 more)

### Community 27 - "favicon/index.ts"
Cohesion: 0.18
Nodes (12): OUTFIT_700_SUBSET_BASE64, buildFaviconSvg(), Font, getFont(), Glyph, renderFaviconIco(), toSVG(), wrapSvg() (+4 more)

### Community 28 - "components"
Cohesion: 0.12
Nodes (16): src/components/patterns/EmptyState.astro, src/lib/cn.ts, description, files, name, components, empty-state, category (+8 more)

### Community 29 - "utilities"
Cohesion: 0.12
Nodes (16): cn, src/components/patterns/NewsletterForm.astro, src/components/patterns/PasswordInput.astro, newsletter-form, password-input, utilities, category, dependencies (+8 more)

### Community 30 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, cross-env, graphql, @payloadcms/email-resend, @payloadcms/plugin-form-builder, @payloadcms/plugin-redirects, @payloadcms/plugin-seo, @payloadcms/richtext-lexical (+7 more)

### Community 31 - "keywords"
Cohesion: 0.13
Nodes (15): typescript, astro-theme, blog, boilerplate, seo, starter, tailwind, theme (+7 more)

### Community 32 - "link.ts"
Cohesion: 0.24
Nodes (10): appearanceOptions, link(), LinkAppearances, LinkType, linkGroup(), LinkGroupType, Header, hero (+2 more)

### Community 33 - "components"
Cohesion: 0.13
Nodes (15): avatar, button, card, icon, input, logo, src/components/patterns/ContactForm.astro, textarea (+7 more)

### Community 34 - "properties"
Cohesion: 0.14
Nodes (15): $ref, additionalProperties, description, type, additionalProperties, description, items, type (+7 more)

### Community 35 - "name"
Cohesion: 0.22
Nodes (10): properties, utility, description, type, description, type, description, name (+2 more)

### Community 36 - "types.ts"
Cohesion: 0.21
Nodes (9): Checkbox(), CheckboxProps, checkboxBoxVariants, CheckboxVariants, Option, Select(), SelectProps, SelectSize (+1 more)

### Community 37 - "ConsentBanner.astro"
Cohesion: 0.16
Nodes (12): categoryGcmMapJson, configJson, ui, consentConfig, ConsentCategory, ConsentCategoryConfig, ConsentConfig, ConsentModeType (+4 more)

### Community 38 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, clean-versions, dev, devsafe, generate:importmap, generate:types, lint (+6 more)

### Community 39 - "importMap.js"
Cohesion: 0.21
Nodes (6): BeforeDashboard(), BeforeLogin(), LogoutButton(), RowLabel(), RowLabel(), Header

### Community 40 - "website/package.json"
Cohesion: 0.14
Nodes (13): author, bugs, url, description, engines, node, homepage, license (+5 more)

### Community 41 - "authenticated.ts"
Cohesion: 0.23
Nodes (8): anyone(), authenticated(), isAuthenticated, Categories, dirname, filename, Media, Users

### Community 42 - "renderFaviconPng"
Cohesion: 0.21
Nodes (9): renderFaviconPng(), GET(), prerender, GET(), prerender, GET(), prerender, GET() (+1 more)

### Community 43 - "component-registry.schema.json"
Cohesion: 0.18
Nodes (10): description, type, $defs, category, description, $id, category, $schema (+2 more)

### Community 44 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, format, format:check, lint, lint:fix (+4 more)

### Community 45 - "FeatureTabs.tsx"
Cohesion: 0.24
Nodes (8): CodeBlock(), codeExamples, highlightCode(), TabContent, tabs, VerticalTab, VerticalTabs(), VerticalTabsProps

### Community 46 - "contact.ts"
Cohesion: 0.24
Nodes (9): rateLimit(), requestCounts, contactSchema, escapeHtml(), POST(), prerender, newsletterSchema, POST() (+1 more)

### Community 47 - "not-found.tsx"
Cohesion: 0.24
Nodes (5): nextConfig, Args, generateMeta(), mergeOpenGraph(), .next/**

### Community 48 - "Posts/index.ts"
Cohesion: 0.25
Nodes (6): Banner, Code, MediaBlock, populateAuthors(), Posts, User

### Community 49 - "card"
Cohesion: 0.18
Nodes (11): src/components/ui/data-display/Card/Card.astro, src/components/ui/data-display/Card/Card.tsx, src/components/ui/data-display/Card/card.variants.ts, src/components/ui/data-display/Card/index.ts, category, dependencies, files, name (+3 more)

### Community 50 - "toast"
Cohesion: 0.18
Nodes (11): src/components/ui/feedback/Toast/index.ts, src/components/ui/feedback/Toast/Toast.astro, src/components/ui/feedback/Toast/Toast.tsx, src/components/ui/feedback/Toast/ToastDemo.tsx, toast, category, dependencies, files (+3 more)

### Community 51 - "button"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Button/Button.astro, src/components/ui/form/Button/Button.tsx, src/components/ui/form/Button/button.variants.ts, src/components/ui/form/Button/index.ts, category, dependencies, files, name (+3 more)

### Community 52 - "checkbox"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Checkbox/Checkbox.astro, src/components/ui/form/Checkbox/Checkbox.tsx, src/components/ui/form/Checkbox/checkbox.variants.ts, src/components/ui/form/Checkbox/index.ts, category, dependencies, files, name (+3 more)

### Community 53 - "radio"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Radio/index.ts, src/components/ui/form/Radio/Radio.astro, src/components/ui/form/Radio/Radio.tsx, src/components/ui/form/Radio/radio.variants.ts, radio, category, dependencies, files (+3 more)

### Community 54 - "select"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Select/index.ts, src/components/ui/form/Select/Select.astro, src/components/ui/form/Select/Select.tsx, src/components/ui/form/Select/select.variants.ts, select, category, dependencies, files (+3 more)

### Community 55 - "switch"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Switch/index.ts, src/components/ui/form/Switch/Switch.astro, src/components/ui/form/Switch/Switch.tsx, src/components/ui/form/Switch/switch.variants.ts, switch, category, dependencies, files (+3 more)

### Community 56 - "textarea"
Cohesion: 0.18
Nodes (11): src/components/ui/form/Textarea/index.ts, src/components/ui/form/Textarea/Textarea.astro, src/components/ui/form/Textarea/Textarea.tsx, src/components/ui/form/Textarea/textarea.variants.ts, textarea, category, dependencies, files (+3 more)

### Community 57 - "Button.tsx"
Cohesion: 0.31
Nodes (7): BaseProps, Button(), ButtonAsButton, ButtonAsLink, ButtonProps, ButtonVariants, isExternalUrl()

### Community 58 - "scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, build:backend, build:website, dev, dev:backend (+1 more)

### Community 59 - "required"
Cohesion: 0.24
Nodes (10): category, dependencies, description, files, name, npm, premium, required (+2 more)

### Community 60 - "avatar"
Cohesion: 0.20
Nodes (10): src/components/ui/data-display/Avatar/Avatar.astro, src/components/ui/data-display/Avatar/avatar.variants.ts, src/components/ui/data-display/Avatar/index.ts, category, dependencies, files, name, premium (+2 more)

### Community 61 - "badge"
Cohesion: 0.20
Nodes (10): src/components/ui/data-display/Badge/Badge.astro, src/components/ui/data-display/Badge/badge.variants.ts, src/components/ui/data-display/Badge/index.ts, category, dependencies, files, name, premium (+2 more)

### Community 62 - "pagination"
Cohesion: 0.20
Nodes (10): src/components/ui/data-display/Pagination/index.ts, src/components/ui/data-display/Pagination/Pagination.astro, src/components/ui/data-display/Pagination/pagination.variants.ts, pagination, category, dependencies, files, name (+2 more)

### Community 63 - "progress"
Cohesion: 0.20
Nodes (10): src/components/ui/data-display/Progress/index.ts, src/components/ui/data-display/Progress/Progress.astro, src/components/ui/data-display/Progress/progress.variants.ts, progress, category, dependencies, files, name (+2 more)

### Community 64 - "skeleton"
Cohesion: 0.20
Nodes (10): src/components/ui/data-display/Skeleton/index.ts, src/components/ui/data-display/Skeleton/Skeleton.astro, src/components/ui/data-display/Skeleton/skeleton.variants.ts, skeleton, category, dependencies, files, name (+2 more)

### Community 65 - "alert"
Cohesion: 0.20
Nodes (10): src/components/ui/feedback/Alert/Alert.astro, src/components/ui/feedback/Alert/alert.variants.ts, src/components/ui/feedback/Alert/index.ts, category, dependencies, files, name, premium (+2 more)

### Community 66 - "input"
Cohesion: 0.20
Nodes (10): src/components/ui/form/Input/index.ts, src/components/ui/form/Input/Input.astro, src/components/ui/form/Input/Input.tsx, input, category, dependencies, files, name (+2 more)

### Community 67 - "accordion"
Cohesion: 0.20
Nodes (10): src/components/ui/overlay/Accordion/Accordion.astro, src/components/ui/overlay/Accordion/accordion.variants.ts, src/components/ui/overlay/Accordion/index.ts, category, dependencies, files, name, premium (+2 more)

### Community 68 - "vertical-tabs"
Cohesion: 0.20
Nodes (10): src/components/ui/overlay/VerticalTabs/index.ts, src/components/ui/overlay/VerticalTabs/VerticalTabs.astro, src/components/ui/overlay/VerticalTabs/VerticalTabs.tsx, vertical-tabs, category, dependencies, files, name (+2 more)

### Community 69 - "Pagination/Pagination.astro"
Cohesion: 0.40
Nodes (5): getPageRange(), Pagination(), PaginationProps, paginationItemVariants, PaginationVariants

### Community 70 - "Alert.astro"
Cohesion: 0.51
Nodes (6): Alert(), AlertProps, iconPaths, alertAccentColors, alertIconColors, AlertVariants

### Community 71 - "Input.astro"
Cohesion: 0.27
Nodes (8): inputStyles, iconStyles, Input(), InputProps, InputSize, inputStyles, inputSizeConfig, InputVariants

### Community 72 - "Accordion.tsx"
Cohesion: 0.47
Nodes (6): Accordion(), AccordionItem, AccordionProps, accordionItemVariants, AccordionTriggerVariants, AccordionVariants

### Community 73 - "dependencies"
Cohesion: 0.22
Nodes (9): astro-icon, @astrojs/cloudflare, @astrojs/vercel, @iconify/react, dependencies, astro-icon, @astrojs/cloudflare, @astrojs/vercel (+1 more)

### Community 74 - "backend/package.json"
Cohesion: 0.22
Nodes (8): description, engines, node, pnpm, license, name, type, version

### Community 75 - "page.tsx"
Cohesion: 0.22
Nodes (3): importMap, Args, Args

### Community 76 - "code-block"
Cohesion: 0.22
Nodes (9): src/components/ui/content/CodeBlock/CodeBlock.astro, src/components/ui/content/CodeBlock/index.ts, category, dependencies, files, name, premium, subcategory (+1 more)

### Community 77 - "avatar-group"
Cohesion: 0.22
Nodes (9): src/components/ui/data-display/AvatarGroup/AvatarGroup.astro, src/components/ui/data-display/AvatarGroup/index.ts, category, dependencies, files, name, premium, subcategory (+1 more)

### Community 78 - "table"
Cohesion: 0.22
Nodes (9): src/components/ui/data-display/Table/index.ts, src/components/ui/data-display/Table/Table.astro, table, category, dependencies, files, name, premium (+1 more)

### Community 79 - "tooltip"
Cohesion: 0.22
Nodes (9): src/components/ui/feedback/Tooltip/index.ts, src/components/ui/feedback/Tooltip/Tooltip.astro, tooltip, category, dependencies, files, name, premium (+1 more)

### Community 80 - "separator"
Cohesion: 0.22
Nodes (9): src/components/ui/layout/Separator/index.ts, src/components/ui/layout/Separator/Separator.astro, separator, category, dependencies, files, name, premium (+1 more)

### Community 81 - "cta"
Cohesion: 0.22
Nodes (9): src/components/ui/marketing/CTA/CTA.astro, src/components/ui/marketing/CTA/index.ts, cta, category, dependencies, files, name, premium (+1 more)

### Community 82 - "logo"
Cohesion: 0.22
Nodes (9): src/components/ui/marketing/Logo/index.ts, src/components/ui/marketing/Logo/Logo.astro, logo, category, dependencies, files, name, premium (+1 more)

### Community 83 - "npm-copy-button"
Cohesion: 0.22
Nodes (9): src/components/ui/marketing/NpmCopyButton/index.ts, src/components/ui/marketing/NpmCopyButton/NpmCopyButton.astro, npm-copy-button, category, dependencies, files, name, premium (+1 more)

### Community 84 - "social-proof"
Cohesion: 0.22
Nodes (9): src/components/ui/marketing/SocialProof/index.ts, src/components/ui/marketing/SocialProof/SocialProof.astro, social-proof, category, dependencies, files, name, premium (+1 more)

### Community 85 - "terminal-demo"
Cohesion: 0.22
Nodes (9): src/components/ui/marketing/TerminalDemo/index.ts, src/components/ui/marketing/TerminalDemo/TerminalDemo.tsx, terminal-demo, category, dependencies, files, name, premium (+1 more)

### Community 86 - "dialog"
Cohesion: 0.22
Nodes (9): src/components/ui/overlay/Dialog/Dialog.astro, src/components/ui/overlay/Dialog/index.ts, dialog, category, dependencies, files, name, premium (+1 more)

### Community 87 - "dropdown"
Cohesion: 0.22
Nodes (9): src/components/ui/overlay/Dropdown/Dropdown.astro, src/components/ui/overlay/Dropdown/index.ts, dropdown, category, dependencies, files, name, premium (+1 more)

### Community 88 - "tabs"
Cohesion: 0.22
Nodes (9): src/components/ui/overlay/Tabs/index.ts, src/components/ui/overlay/Tabs/Tabs.astro, tabs, category, dependencies, files, name, premium (+1 more)

### Community 89 - "icon"
Cohesion: 0.22
Nodes (9): src/components/ui/primitives/Icon/Icon.astro, src/components/ui/primitives/Icon/index.ts, icon, category, dependencies, files, name, premium (+1 more)

### Community 90 - "properties"
Cohesion: 0.22
Nodes (9): properties, type, component, description, type, premium, subcategory, description (+1 more)

### Community 91 - "files"
Cohesion: 0.22
Nodes (9): description, items, type, type, description, items, type, files (+1 more)

### Community 92 - "Progress/index.ts"
Cohesion: 0.61
Nodes (5): Progress(), ProgressProps, progressBarVariants, progressTrackVariants, ProgressVariants

### Community 93 - "Textarea.astro"
Cohesion: 0.42
Nodes (5): Textarea(), TextareaProps, TextareaSize, textareaStyles, TextareaVariants

### Community 94 - "content.config.ts"
Cohesion: 0.22
Nodes (8): authors, blog, collections, faqs, localeSchema, pages, projects, stack

### Community 95 - "gallery.ts"
Cohesion: 0.43
Nodes (4): GalleryImageSlide, GallerySlide, GalleryVideoSlide, isVideoSlide()

### Community 97 - "generatePreviewPath.ts"
Cohesion: 0.32
Nodes (6): generateURL(), collectionPrefixMap, generatePreviewPath(), Props, getFrontendURL(), getServerSideURL()

### Community 98 - "seed.ts"
Cohesion: 0.36
Nodes (7): collections, fetchFileByURL(), globals, heading(), LexicalContent, paragraph(), seed()

### Community 99 - "admin.e2e.spec.ts"
Cohesion: 0.39
Nodes (5): login(), LoginOptions, cleanupTestUser(), seedTestUser(), testUser

### Community 100 - "footer"
Cohesion: 0.25
Nodes (8): src/components/layout/Footer.astro, src/components/layout/footer.variants.ts, footer, category, dependencies, files, name, premium

### Community 101 - "header"
Cohesion: 0.25
Nodes (8): src/components/layout/Header.astro, src/components/layout/header.variants.ts, header, category, dependencies, files, name, premium

### Community 102 - "utilities"
Cohesion: 0.25
Nodes (8): type, properties, type, dependencies, utilities, description, items, type

### Community 103 - "ProofTile.astro"
Cohesion: 0.54
Nodes (4): ProofTileVariants, hasBody, ProofTile(), ProofTileProps

### Community 104 - "Skeleton.astro"
Cohesion: 0.54
Nodes (4): Skeleton(), SkeletonProps, style, SkeletonVariants

### Community 105 - "Radio/index.ts"
Cohesion: 0.39
Nodes (5): Radio(), RadioProps, radioCardVariants, radioCircleVariants, RadioVariants

### Community 106 - "Switch/index.ts"
Cohesion: 0.57
Nodes (5): Switch(), SwitchProps, switchThumbVariants, switchTrackVariants, SwitchVariants

### Community 107 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 108 - "plugins/index.ts"
Cohesion: 0.29
Nodes (5): Page, Post, Project, Service, plugins

### Community 109 - "form-field"
Cohesion: 0.29
Nodes (7): src/components/patterns/FormField.astro, form-field, category, dependencies, files, name, premium

### Community 110 - "search-input"
Cohesion: 0.29
Nodes (7): src/components/patterns/SearchInput.astro, search-input, category, dependencies, files, name, premium

### Community 111 - "stat-card"
Cohesion: 0.29
Nodes (7): src/components/patterns/StatCard.astro, stat-card, category, dependencies, files, name, premium

### Community 113 - "overlay/index.ts"
Cohesion: 0.33
Nodes (3): Tab, Tabs(), TabsProps

### Community 114 - "Badge.tsx"
Cohesion: 0.73
Nodes (3): Badge(), BadgeProps, BadgeVariants

### Community 115 - "TerminalDemo.tsx"
Cohesion: 0.40
Nodes (4): LineType, script, ScriptLine, TerminalDemo()

### Community 116 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 117 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 118 - "Analytics.astro"
Cohesion: 0.40
Nodes (3): analyticsDataJson, boolean, string

### Community 119 - "ShareButtons.astro"
Cohesion: 0.40
Nodes (4): encodedTitle, encodedUrl, locale, shareLinks

### Community 120 - "LetterGlitch.tsx"
Cohesion: 0.40
Nodes (3): BRAND_VARS, FALLBACK_COLORS, LetterGlitchProps

### Community 121 - "[]"
Cohesion: 0.70
Nodes (5): [], applyMode(), initThemeToggle(), readMode(), syncLabel()

### Community 122 - "Dialog.astro"
Cohesion: 0.80
Nodes (4): close(), getFocusableElements(), open(), trapFocus()

### Community 123 - "Dialog.tsx"
Cohesion: 0.50
Nodes (3): Dialog(), DialogProps, sizes

### Community 124 - "tailwind-merge"
Cohesion: 0.50
Nodes (4): clsx, tailwind-merge, npm, tailwind-merge

### Community 125 - "version"
Cohesion: 0.50
Nodes (4): version, description, pattern, type

### Community 127 - "astro-env-server.ts"
Cohesion: 0.50
Nodes (3): BING_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION, SITE_URL

### Community 128 - "react-dom"
Cohesion: 0.67
Nodes (3): react-dom, react-dom, react-dom

### Community 129 - "eslint"
Cohesion: 0.67
Nodes (3): eslint, eslint, eslint

### Community 130 - "@types/react"
Cohesion: 0.67
Nodes (3): @types/react, @types/react, @types/react

### Community 131 - "@types/react-dom"
Cohesion: 0.67
Nodes (3): @types/react-dom, @types/react-dom, @types/react-dom

### Community 139 - "Separator/index.ts"
Cohesion: 0.67
Nodes (3): Separator(), SeparatorProps, SeparatorVariants

### Community 185 - "required"
Cohesion: 0.40
Nodes (6): categories, components, utilities, version, required, required

## Knowledge Gaps
- **857 isolated node(s):** `$schema`, `model`, `AGENTS.md`, `backend/AGENTS.md`, `website/AGENTS.md` (+852 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn` connect `components` to `tailwind-merge`?**
  _High betweenness centrality (0.327) - this node is a cross-community bridge._
- **Why does `npm` connect `tailwind-merge` to `components`?**
  _High betweenness centrality (0.324) - this node is a cross-community bridge._
- **What connects `$schema`, `model`, `AGENTS.md` to the rest of the system?**
  _857 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._
- **Should `i18n/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06845513413506013 - nodes in this community are weakly interconnected._
- **Should `Header.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.0666049953746531 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._