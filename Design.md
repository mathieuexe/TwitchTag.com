# TwitchTag - Design Document

## Palette de couleurs (Style Twitch)

### Couleurs principales
- **Twitch Purple**: #9146FF (Couleur principale, boutons, accents)
- **Twitch Purple Hover**: #772CE8 (Survol)
- **Twitch Purple Active**: #5C16C5 (Actif)

### Couleurs de fond
- **Background Primary**: #0E0E10 (Fond principal sombre)
- **Background Secondary**: #18181B (Cartes, sections)
- **Background Tertiary**: #1F1F23 (Éléments surélevés)
- **Background Hover**: #26262C (Survol)

### Couleurs de texte
- **Text Primary**: #EFEFF1 (Texte principal)
- **Text Secondary**: #ADADB8 (Texte secondaire)
- **Text Disabled**: #53535F (Texte désactivé)

### Couleurs d'état
- **Success**: #00F593 (Vert succès)
- **Error**: #F4212E (Rouge erreur)
- **Warning**: #F5A623 (Orange avertissement)
- **Info**: #1E90FF (Bleu info)

### Couleurs spéciales
- **Live Red**: #E91916 (Indicateur en direct)
- **Prime Blue**: #00A8E1 (Twitch Prime)

## Typographie

### Police principale
- **Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Tailles de police
- **Text XS**: 12px / 0.75rem
- **Text SM**: 14px / 0.875rem
- **Text Base**: 16px / 1rem
- **Text LG**: 18px / 1.125rem
- **Text XL**: 20px / 1.25rem
- **Text 2XL**: 24px / 1.5rem
- **Text 3XL**: 30px / 1.875rem
- **Text 4XL**: 36px / 2.25rem

### Poids de police
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Espacement

### Espacement de base (4px scale)
- **space-0**: 0
- **space-1**: 4px / 0.25rem
- **space-2**: 8px / 0.5rem
- **space-3**: 12px / 0.75rem
- **space-4**: 16px / 1rem
- **space-5**: 20px / 1.25rem
- **space-6**: 24px / 1.5rem
- **space-8**: 32px / 2rem
- **space-10**: 40px / 2.5rem
- **space-12**: 48px / 3rem
- **space-16**: 64px / 4rem
- **space-20**: 80px / 5rem
- **space-24**: 96px / 6rem

### Border Radius
- **rounded-none**: 0
- **rounded-sm**: 2px / 0.125rem
- **rounded**: 4px / 0.25rem
- **rounded-md**: 6px / 0.375rem
- **rounded-lg**: 8px / 0.5rem
- **rounded-xl**: 12px / 0.75rem
- **rounded-2xl**: 16px / 1rem
- **rounded-3xl**: 24px / 1.5rem
- **rounded-full**: 9999px

## Composants UI

### Boutons

#### Bouton Primaire (Twitch Purple)
- Fond: #9146FF
- Texte: #FFFFFF
- Border-radius: rounded-md (6px)
- Padding: space-2 space-4 (8px 16px)
- Hover: #772CE8
- Active: #5C16C5
- Transition: all 200ms ease

#### Bouton Secondaire
- Fond: transparent
- Bordure: 1px solid #53535F
- Texte: #EFEFF1
- Hover: fond #26262C

#### Bouton Ghost
- Fond: transparent
- Texte: #ADADB8
- Hover: fond #26262C

### Inputs

#### Input Standard
- Fond: #18181B
- Bordure: 1px solid #303032
- Border-radius: rounded-md (6px)
- Texte: #EFEFF1
- Placeholder: #53535F
- Focus: bordure #9146FF, ring 2px #9146FF/20

#### Input avec icône
- Padding-left: space-10 (40px) pour l'icône
- Icône: #ADADB8, position absolute left space-3

### Cards

#### Card Standard
- Fond: #18181B
- Border-radius: rounded-xl (12px)
- Padding: space-6 (24px)
- Shadow: shadow-lg

#### Card avec hover
- Hover: transform translateY(-2px)
- Transition: all 300ms ease

### Navigation

#### Header/Navbar
- Fond: #18181B
- Border-bottom: 1px solid #303032
- Hauteur: 64px
- Padding: space-4 (16px)

#### Sidebar
- Fond: #1F1F23
- Largeur: 240px
- Border-right: 1px solid #303032

### Badges/Tags

#### Badge Live
- Fond: #E91916
- Texte: #FFFFFF
- Border-radius: rounded-sm (2px)
- Padding: space-1 space-2 (4px 8px)
- Font-size: text-xs (12px)

#### Badge Category
- Fond: #26262C
- Texte: #ADADB8
- Border-radius: rounded-full

## Effets et Animations

### Transitions standard
- **Fast**: 150ms ease
- **Normal**: 200ms ease
- **Slow**: 300ms ease

### Animations
- **Count-up**: transition numérique smooth 500ms
- **Pulse live**: scale 1.0 → 1.05 → 1.0, 2s infinite
- **Hover lift**: translateY(-2px), 300ms ease
- **Skeleton loading**: shimmer effect 1.5s infinite

### Ombres
- **shadow-sm**: 0 1px 2px rgba(0,0,0,0.1)
- **shadow**: 0 1px 3px rgba(0,0,0,0.2)
- **shadow-md**: 0 4px 6px rgba(0,0,0,0.2)
- **shadow-lg**: 0 10px 15px rgba(0,0,0,0.3)
- **shadow-xl**: 0 20px 25px rgba(0,0,0,0.4)
- **shadow-purple**: 0 0 20px rgba(145,70,255,0.3)

### Gradients
- **gradient-purple**: linear-gradient(135deg, #9146FF 0%, #772CE8 100%)
- **gradient-dark**: linear-gradient(180deg, #18181B 0%, #0E0E10 100%)
- **gradient-card**: linear-gradient(145deg, #1F1F23 0%, #18181B 100%)

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile First
- Layout par défaut: mobile
- Progressive enhancement vers desktop
- Navigation: hamburger menu sur mobile
- Sidebar: collapsible sur tablet/mobile

## Icônes

### Librairie
- **Lucide React** - Icônes modernes et cohérentes

### Icônes courantes
- Navigation: Home, Search, Settings, User
- Actions: Copy, Check, X, Trash, Edit
- Social: Twitch (custom), Twitter, Discord
- Statut: CheckCircle, XCircle, AlertCircle, Info

## Accessibilité

### Standards
- Contraste minimum 4.5:1 pour le texte
- Focus visible sur tous les éléments interactifs
- ARIA labels sur les icônes et boutons
- Support clavier complet

### Réduction de mouvement
- Respecter prefers-reduced-motion
- Désactiver animations si demandé
