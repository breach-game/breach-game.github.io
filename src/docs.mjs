/** The documentation page, one list of sections per language. Bodies are HTML written here. */
import { GAME } from './content.mjs';

const PACKS = 'https://github.com/breach-game/packs';
const GUIDE = `${PACKS}/blob/main/CONTRIBUTING.md`;
const WORKFLOW = `${PACKS}/blob/main/docs/workflow.md`;

export const DOCS = {
  en: [
    {
      id: 'start',
      title: 'Getting started',
      body: `
<p>Open <a href="${GAME}">${GAME.replace('https://', '')}</a> in a recent browser on a computer. There is nothing to install and no account to create. On the title screen, pick your language (English or French) and how much help you want, then start a new game.</p>
<ul>
  <li><b>Keyboard and mouse.</b> BREACH is played in a terminal, so a physical keyboard makes it far more fun. A large screen helps too: the workstation shows several windows side by side.</li>
  <li><b>Your progress is saved in your browser</b> (IndexedDB), after every action. Close the tab and come back later: you resume where you left off. Clearing the site’s data from your browser starts again from scratch.</li>
  <li><b>Sound</b> starts on your first click or key press, and can be switched off or balanced in the settings. Effects such as scanlines and glitches follow your system’s <i>reduce motion</i> setting and have their own switch.</li>
</ul>
<div class="note green"><b>First time with a terminal?</b> Choose the <i>Guided</i> level. Ada will give you each command to type, and explain what it does.</div>`,
    },
    {
      id: 'desk',
      title: 'The LR-OS workstation',
      body: `
<p>The whole screen is the pentester’s workstation, LR-OS. There is no game menu: everything lives in windows, and only one window is active at a time.</p>
<ul>
  <li><b>Terminal</b>: where you type commands. The prompt is <code>kestrel@lignerouge</code>.</li>
  <li><b>Browser</b>: shows the target’s web pages, drawn by the game itself. <i>View source</i> shows the HTML, comments included.</li>
  <li><b>Messages</b>: Ada’s briefing, her advice, and the mission objectives.</li>
  <li><b>Notebook</b>: what you note with <code>notes add</code>.</li>
  <li><b>Network map</b>: the desktop wallpaper. Hosts appear as you discover them, and turn red once compromised.</li>
</ul>
<p>Colour always carries meaning, and is always paired with an icon or a label:</p>
<ul class="legend">
  <li><i class="dot-red"></i>red · attack, compromised host</li>
  <li><i class="dot-cyan"></i>cyan · defence, logs, Blue Team</li>
  <li><i class="dot-violet"></i>violet · anything AI</li>
  <li><i class="dot-green"></i>green · success and flags only</li>
  <li><i class="dot-amber"></i>amber · noise, alert, detection</li>
</ul>
<figure><img src="/assets/img/shots/recon-map-1600.webp" alt="The LR-OS desktop with the terminal, the messages and the network map." width="1600" height="1000" loading="lazy"><figcaption>Mission 1: the network map fills up as the scan finds hosts.</figcaption></figure>`,
    },
    {
      id: 'commands',
      title: 'Commands',
      commands: true,
      body: `
<p>The commands imitate the real tools, their options and their output, which stays in English as in real life. None of them sends anything on a real network: they all read the fictional world of the mission. Type <code>help</code> in the game for the list, and <code>explain &lt;tool&gt;</code> to learn what a tool does and how defenders spot it.</p>`,
    },
    {
      id: 'missions',
      title: 'How a mission works',
      body: `
<ol>
  <li><b>The briefing.</b> Ada explains the target and the mandate. <code>mission</code> shows it again at any time.</li>
  <li><b>The objectives.</b> Each mission has a few, listed in the messages window. Some are optional. You can reach them in any order.</li>
  <li><b>The flags.</b> A flag looks like <code>FLAG{...}</code>. When you find one, type <code>submit FLAG{...}</code>. The game compares its fingerprint; no language model ever decides whether you succeeded.</li>
  <li><b>The noise gauge.</b> Loud actions (a full port scan, a brutal request) fill it, quiet ones barely move it. At 40% and 70% Ada warns you. At 100%, NovaMind’s SOC spots you: you go back to the last checkpoint, and the detection costs points.</li>
  <li><b>Hints.</b> <code>hint</code> asks Ada for help, in three levels, from a nudge to the answer. Each hint costs 10 points.</li>
  <li><b>The debrief.</b> The screen switches to the Blue Team. You see your actions in the target’s log, where you were spotted, and what should have been done. A mission is only finished after its debrief.</li>
</ol>
<div class="note amber"><b>Out of scope.</b> Aim at anything outside the mandate, a real address for instance, and the game refuses before anything leaves. Ada then reminds you that, in real life, attacking a system without written authorisation is a crime (article 323-1 of the French Penal Code).</div>`,
    },
    {
      id: 'seasons',
      title: 'Seasons',
      body: `
<p>The NovaMind campaign is season 1. Ten more seasons follow, each in its own fictional place and with its own save, opened from the <i>Seasons</i> button of the title screen. They are all open from the start; the title screen suggests the next one.</p>
<table class="cmds">
  <thead><tr><th>Season</th><th>Where</th><th>What you learn</th></tr></thead>
  <tbody>
    <tr><td>2</td><td>Halcyon, a build chain</td><td>Dependency confusion, then its defence.</td></tr>
    <tr><td>3</td><td>Pélican, an online shop</td><td>The classic flaws of the web: injection, markup in a review, access to a neighbour’s account, business logic.</td></tr>
    <tr><td>4</td><td>Town of Corbelle</td><td>A ransomware crisis, on the defence side only: contain, decide, restore, detect.</td></tr>
    <tr><td>5</td><td>Sélène, teams of AI agents</td><td>Shared index, poisoned memory, invented package, one agent posing as another, and a guardrail you write.</td></tr>
    <tr><td>6</td><td>Alto, on a fictional cloud</td><td>Public storage, a token in a build log, a role that is too wide, an application granted by an employee.</td></tr>
    <tr><td>7</td><td>Festival Lumière Noire</td><td>A bug bounty: its rules as a mandate, a logic flaw, a disclosure report, phishing seen by the defence.</td></tr>
    <tr><td>8</td><td>Verdure, a vertical farm</td><td>Connected devices: an open message broker, a factory key shared by every sensor, a night on the defence side.</td></tr>
    <tr><td>9</td><td>Ligne Rouge itself</td><td>The finale. No new command: you defend your own firm with what the seasons taught.</td></tr>
    <tr><td>10</td><td>The Lemerle family home</td><td>Defence only, with the family’s agreement: the home network, the router, a camera account, a Zigbee and Z-Wave hub, scams by text and voice, the mailbox, a plug that talks at night. Each debrief has a <i>To do at home</i> card.</td></tr>
    <tr><td>11</td><td>Comptoir, a bank that is an API</td><td>The OWASP API Security Top 10: an old version still served, an object served without checking its owner, a code with no limit on tries, a server that fetches for you, a loose OAuth return address, a flood of valid requests.</td></tr>
  </tbody>
</table>
<p>Some seasons ask for more than flags: a file to repair and have checked with <code>verify</code>, a faulty line to point at with <code>review</code>, a detection rule or an agent guardrail to write and try with <code>rule test</code> and <code>eval run</code>, or a decision where no option is wrong but each has a price.</p>`,
    },
    {
      id: 'levels',
      title: 'Levels and score',
      body: `
<table class="cmds">
  <thead><tr><th>Level</th><th>What Ada gives</th><th>Multiplier</th></tr></thead>
  <tbody>
    <tr><td>Guided</td><td>Every command to type, explained.</td><td>×1</td></tr>
    <tr><td>Autonomous</td><td>The direction to take, not the command.</td><td>×1.25</td></tr>
    <tr><td>Expert</td><td>The briefing and the objectives only.</td><td>×1.5</td></tr>
  </tbody>
</table>
<p>A mission’s score is the points of its flags, plus 50 per objective, multiplied by the level, minus 10 per hint and 25 per detection. The level that counts is the most helped one you used during the mission: you can switch to more help at any time, but it lowers the multiplier for good. The debrief shows the detail.</p>`,
    },
    {
      id: 'characters',
      title: 'Talking to characters',
      body: `
<p>Some missions are about people and AIs: Théo the support intern, Nova the assistant, Iris the CV screener, Atlas the internal agent. You talk to them in a chat window inside a web page, or from the terminal with <code>curl -d "your message" &lt;address&gt;</code>.</p>
<p>Every character is scripted. They recognise what you ask (words, and families of techniques such as role-play, translation, false authority), and the script decides what they say and what they let slip. That is what makes a mission fair and replayable.</p>
<h3>Optional: your own Anthropic API key</h3>
<p>In the settings you can give your own key and switch on, one by one, two uses, each with its model and a cost estimate:</p>
<ul>
  <li><b>Understand my messages</b>: a model recognises what you mean even when worded freely, in another language or with typos. It can only point at what the character already listens for, never invent a password you have to find.</li>
  <li><b>Reword the replies</b>: a model says the line the script chose, in its own words. It never sees a secret before the script decided to reveal it, and anything doubtful falls back to the scripted line.</li>
</ul>
<p>The key stays in your browser (session storage, or local storage if you ask), never in your save. Calls go straight from your browser to <code>api.anthropic.com</code>, and are capped per use. Without a key, the game makes no outside request at all.</p>`,
    },
    {
      id: 'community-play',
      title: 'Community missions',
      body: `
<p>On the title screen, <i>Community missions</i> lists missions written by players and published from the <a href="${PACKS}">breach-game/packs</a> repository.</p>
<ul>
  <li>The catalogue is signed (ECDSA P-256). The game checks the signature with a key built into it, then checks every pack against its SHA-256 before reading it.</li>
  <li>Every community pack passed the same validator as the official missions: reserved domains only, no code, a solution that finishes the mission in every language it declares.</li>
  <li>Each community mission is saved separately, so it never touches your campaign.</li>
</ul>
<p>The store also holds the BREACH team’s own extra content: forty case files written from real incidents (the most sensitive ones played on the defence side only), twelve fictional side series, nine Expert-only challenges, a <i>First steps</i> collection, and five paths that suggest an order through everything, official missions included. A path step counts as soon as you finish it in any save.</p>`,
    },
    {
      id: 'create',
      title: 'Write your own mission',
      body: `
<p>A pack is a folder of YAML files. A <b>world</b> pack describes a fictional network: hosts, files, web pages, DNS, characters. A <b>mission</b> pack is played in a world, yours or the official NovaMind one: objectives, flags, rules, hints, guidance and the debrief.</p>
<pre class="code glass"><span class="c"># one folder per pack</span>
packs/jdoe.lost-backup/
  pack.yaml       <span class="c"># id, version, title, authors, languages</span>
  mission.yaml    <span class="c"># objectives, flags, rules, hints, debrief</span>
  i18n/en.yaml    <span class="c"># every text, in English</span>
  i18n/fr.yaml    <span class="c"># and in French</span>
  solution.txt    <span class="c"># the commands that finish the mission</span></pre>
<h3>The rules every pack follows</h3>
<ol>
  <li><b>No real target</b>: reserved domains (<code>*.test</code>, <code>*.example</code>…) and private or documentation addresses only.</li>
  <li><b>Classes of weaknesses, not exploits</b>: illustrate an OWASP category; nothing should work as-is against a real system.</li>
  <li><b>Always under a mandate</b>: the story says the player is authorised.</li>
  <li><b>Every attack has its defence</b>: the debrief explains how to prevent what the player did.</li>
  <li><b>For players aged 16 and over</b>: thriller tone, humour welcome, nothing shocking.</li>
  <li><b>Deterministic success</b>: flags are checked by the engine, never by a model.</li>
</ol>
<h3>Check it locally</h3>
<p>Clone the packs repository next to the game, install the game’s dependencies, then run its validator on your packs. It checks the schema and the safety rules, and replays your solution in every language:</p>
<pre class="code glass">git clone https://github.com/breach-game/packs.git
git clone https://github.com/breach-game/breach.git
cd breach &amp;&amp; pnpm install
pnpm --silent --filter @breach/pack-cli run cli check "$PWD/../packs/packs" --community --with "$PWD/content"</pre>
<p>Then open a pull request. CI runs the same checks, a maintainer reviews the story and the lesson, and the merge publishes your mission to the signed catalogue.</p>
<p><a class="btn ghost" href="${GUIDE}">The complete mission guide →</a> <a class="btn ghost" href="${WORKFLOW}">Publishing workflow →</a></p>`,
    },
    {
      id: 'privacy',
      title: 'Safety and privacy',
      body: `
<p>BREACH never sends a single packet to a machine of the game world: there is no such machine. The commands are a game engine written in TypeScript that runs in your tab. The in-game browser draws pages from data, loads no URL and follows no real link.</p>
<table class="cmds">
  <thead><tr><th>Request</th><th>Destination</th><th>When</th></tr></thead>
  <tbody>
    <tr><td>Game, fonts, missions</td><td>the site’s own origin</td><td>on load, then cached</td></tr>
    <tr><td>Community catalogue</td><td><code>breach-game.github.io/packs/</code></td><td>when you open Community missions</td></tr>
    <tr><td>Model help</td><td><code>api.anthropic.com</code></td><td>only with your own key, for the uses you switch on</td></tr>
  </tbody>
</table>
<p>The game’s Content Security Policy only allows those destinations. There is no analytics, no cookie and no third-party script in the game. This presentation site counts its visits with a self-hosted <a href="https://umami.is/">Umami</a>: no cookie, no personal data, and nothing is counted if your browser sends Do Not Track. The full security model, and how to report a problem, are in <a href="https://github.com/breach-game/breach/blob/main/SECURITY.md">SECURITY.md</a>.</p>`,
    },
    {
      id: 'faq',
      title: 'FAQ',
      body: `
<h3>Does BREACH teach real hacking?</h3>
<p>It teaches how attacks work and how to defend against them: reconnaissance, secrets in Git history, social engineering, prompt injection, agents with too many rights, lateral movement. It does not hand out working exploits: the flaws are classes, illustrated on a fictional company.</p>
<h3>Is it legal?</h3>
<p>Yes. Nothing leaves your browser for the game world, and every target is invented. The game is also a reminder that attacking a real system without written authorisation is a crime.</p>
<h3>Who is it for?</h3>
<p>Anyone aged 16 and over who is curious about security and AI: students, developers, teams discovering the risks of LLMs, classrooms. The Guided level needs no prior knowledge.</p>
<h3>Is it free?</h3>
<p>Yes, and open source. The optional model help uses your own API key, billed by its provider.</p>
<h3>Can I use it in a class?</h3>
<p>Yes: it runs in any recent browser, needs no account, and every mission ends with a debrief that is a ready-made discussion. Missions can also be written for a course and shared as community packs.</p>`,
    },
  ],

  fr: [
    {
      id: 'start',
      title: 'Pour commencer',
      body: `
<p>Ouvrez <a href="${GAME}">${GAME.replace('https://', '')}</a> dans un navigateur récent, sur un ordinateur. Rien à installer, aucun compte à créer. Sur l’écran titre, choisissez la langue (français ou anglais) et le niveau d’aide, puis lancez une nouvelle partie.</p>
<ul>
  <li><b>Clavier et souris.</b> BREACH se joue dans un terminal : un vrai clavier rend le jeu bien plus agréable. Un grand écran aide aussi, le poste affiche plusieurs fenêtres côte à côte.</li>
  <li><b>La progression est sauvegardée dans votre navigateur</b> (IndexedDB), après chaque action. Fermez l’onglet, revenez plus tard : vous reprenez où vous en étiez. Effacer les données du site dans le navigateur repart de zéro.</li>
  <li><b>Le son</b> démarre au premier clic ou à la première touche, et se coupe ou se règle dans les réglages. Les effets (scanlines, glitch) suivent le réglage <i>réduire les animations</i> du système et ont leur propre interrupteur.</li>
</ul>
<div class="note green"><b>Premier contact avec un terminal ?</b> Choisissez le niveau <i>Guidé</i>. Ada vous donnera chaque commande à taper, et vous expliquera ce qu’elle fait.</div>`,
    },
    {
      id: 'desk',
      title: 'Le poste LR-OS',
      body: `
<p>L’écran entier est le poste du pentesteur, LR-OS. Pas de menu de jeu : tout vit dans des fenêtres, et une seule est active à la fois.</p>
<ul>
  <li><b>Terminal</b> : là où l’on tape les commandes. Le prompt est <code>kestrel@lignerouge</code>.</li>
  <li><b>Navigateur</b> : affiche les pages web de la cible, dessinées par le jeu. <i>Voir la source</i> montre le HTML, commentaires compris.</li>
  <li><b>Messagerie</b> : le briefing d’Ada, ses conseils, et les objectifs de la mission.</li>
  <li><b>Carnet</b> : ce que vous notez avec <code>notes add</code>.</li>
  <li><b>Carte du réseau</b> : le fond d’écran du bureau. Les hôtes apparaissent quand vous les découvrez, et passent au rouge une fois compromis.</li>
</ul>
<p>La couleur porte toujours le sens, et elle est toujours doublée d’une icône ou d’un libellé :</p>
<ul class="legend">
  <li><i class="dot-red"></i>rouge · attaque, machine compromise</li>
  <li><i class="dot-cyan"></i>cyan · défense, journaux, Blue Team</li>
  <li><i class="dot-violet"></i>violet · tout ce qui est IA</li>
  <li><i class="dot-green"></i>vert · succès et flags uniquement</li>
  <li><i class="dot-amber"></i>ambre · bruit, alerte, détection</li>
</ul>
<figure><img src="/assets/img/shots/recon-map-1600.webp" alt="Le bureau LR-OS avec le terminal, la messagerie et la carte du réseau." width="1600" height="1000" loading="lazy"><figcaption>Mission 1 : la carte se remplit au fil des hôtes trouvés par le scan.</figcaption></figure>`,
    },
    {
      id: 'commands',
      title: 'Les commandes',
      commands: true,
      body: `
<p>Les commandes imitent les vrais outils, leurs options et leur sortie, qui reste en anglais comme dans la réalité. Aucune n’envoie quoi que ce soit sur un vrai réseau : toutes lisent le monde fictif de la mission. Tapez <code>help</code> dans le jeu pour la liste, et <code>explain &lt;outil&gt;</code> pour savoir ce que fait un outil et comment la défense le repère.</p>`,
    },
    {
      id: 'missions',
      title: 'Le déroulé d’une mission',
      body: `
<ol>
  <li><b>Le briefing.</b> Ada présente la cible et le mandat. <code>mission</code> le réaffiche à tout moment.</li>
  <li><b>Les objectifs.</b> Chaque mission en a quelques-uns, listés dans la messagerie. Certains sont facultatifs. On peut les atteindre dans n’importe quel ordre.</li>
  <li><b>Les flags.</b> Un flag ressemble à <code>FLAG{...}</code>. Quand vous en trouvez un, tapez <code>submit FLAG{...}</code>. Le jeu compare son empreinte ; aucun modèle de langage ne décide jamais de votre réussite.</li>
  <li><b>La jauge de bruit.</b> Les actions bruyantes (un scan complet, une requête brutale) la remplissent, les discrètes la bougent à peine. À 40 % et 70 %, Ada vous prévient. À 100 %, le SOC de NovaMind vous repère : retour au dernier point de sauvegarde, et la détection coûte des points.</li>
  <li><b>Les indices.</b> <code>hint</code> demande de l’aide à Ada, en trois niveaux, du coup de pouce à la réponse. Chaque indice coûte 10 points.</li>
  <li><b>Le débrief.</b> L’écran passe en Blue Team. Vous voyez vos actions dans le journal de la cible, où vous avez été repéré, et ce qu’il aurait fallu faire. Une mission n’est terminée qu’après son débrief.</li>
</ol>
<div class="note amber"><b>Hors périmètre.</b> Visez quoi que ce soit hors du mandat, une vraie adresse par exemple, et le jeu refuse avant que rien ne parte. Ada rappelle alors que, dans la vraie vie, attaquer un système sans autorisation écrite est un délit (article 323-1 du Code pénal).</div>`,
    },
    {
      id: 'seasons',
      title: 'Les saisons',
      body: `
<p>La campagne NovaMind est la saison 1. Dix autres saisons suivent, chacune dans son propre lieu fictif et avec sa propre sauvegarde, depuis le bouton <i>Saisons</i> de l’écran titre. Elles sont toutes ouvertes dès le départ ; l’écran titre propose la suivante.</p>
<table class="cmds">
  <thead><tr><th>Saison</th><th>Où</th><th>Ce qu’on y apprend</th></tr></thead>
  <tbody>
    <tr><td>2</td><td>Halcyon, une chaîne de fabrication</td><td>La confusion de dépendances, puis sa parade.</td></tr>
    <tr><td>3</td><td>Pélican, une boutique en ligne</td><td>Les failles classiques du web : injection, balisage dans un avis, accès au compte du voisin, logique métier.</td></tr>
    <tr><td>4</td><td>Ville de Corbelle</td><td>Une crise de rançongiciel, uniquement côté défense : contenir, décider, restaurer, détecter.</td></tr>
    <tr><td>5</td><td>Sélène, des équipes d’agents IA</td><td>Index partagé, mémoire empoisonnée, paquet inventé, agent qui se fait passer pour un autre, et un garde-fou à écrire.</td></tr>
    <tr><td>6</td><td>Alto, sur un cloud fictif</td><td>Stockage public, jeton dans un journal de build, rôle trop large, application autorisée par un employé.</td></tr>
    <tr><td>7</td><td>Festival Lumière Noire</td><td>Un bug bounty : son règlement comme mandat, une faille de logique, un rapport de divulgation, l’hameçonnage vu par la défense.</td></tr>
    <tr><td>8</td><td>Verdure, une ferme verticale</td><td>Les objets connectés : un courtier de messages ouvert, une clé d’usine commune à tous les capteurs, une nuit côté défense.</td></tr>
    <tr><td>9</td><td>Ligne Rouge elle-même</td><td>La finale. Aucune commande nouvelle : vous défendez votre propre cabinet avec ce que les saisons vous ont appris.</td></tr>
    <tr><td>10</td><td>La maison de la famille Lemerle</td><td>Côté défense seulement, avec l’accord de la famille : le réseau de la maison, la box, le compte d’une caméra, un hub Zigbee et Z-Wave, les arnaques par SMS et par la voix, la messagerie, une prise qui parle la nuit. Chaque débrief porte une carte <i>À faire chez toi</i>.</td></tr>
    <tr><td>11</td><td>Comptoir, une banque qui est une API</td><td>L’OWASP API Security Top 10 : une vieille version encore servie, un objet servi sans vérifier son propriétaire, un code sans limite d’essais, un serveur qui va chercher à votre place, une adresse de retour OAuth trop souple, un afflux de requêtes valides.</td></tr>
  </tbody>
</table>
<p>Certaines saisons demandent plus que des flags : un fichier à réparer et à faire contrôler avec <code>verify</code>, une ligne fautive à désigner avec <code>review</code>, une règle de détection ou un garde-fou d’agent à écrire puis à essayer avec <code>rule test</code> et <code>eval run</code>, ou une décision où aucune option n’est fausse mais où chacune a un prix.</p>`,
    },
    {
      id: 'levels',
      title: 'Niveaux et score',
      body: `
<table class="cmds">
  <thead><tr><th>Niveau</th><th>Ce que donne Ada</th><th>Multiplicateur</th></tr></thead>
  <tbody>
    <tr><td>Guidé</td><td>Chaque commande à taper, expliquée.</td><td>×1</td></tr>
    <tr><td>Autonome</td><td>La direction à prendre, pas la commande.</td><td>×1,25</td></tr>
    <tr><td>Expert</td><td>Le briefing et les objectifs seulement.</td><td>×1,5</td></tr>
  </tbody>
</table>
<p>Le score d’une mission : les points des flags, plus 50 par objectif, multipliés par le niveau, moins 10 par indice et 25 par détection. Le niveau compté est le plus aidé utilisé pendant la mission : on peut demander plus d’aide à tout moment, mais le multiplicateur baisse pour de bon. Le débrief affiche le détail.</p>`,
    },
    {
      id: 'characters',
      title: 'Parler aux personnages',
      body: `
<p>Certaines missions passent par des humains et des IA : Théo le stagiaire du support, Nova l’assistante, Iris qui trie les CV, Atlas l’agent interne. On leur parle dans une fenêtre de discussion sur une page web, ou depuis le terminal avec <code>curl -d "votre message" &lt;adresse&gt;</code>.</p>
<p>Chaque personnage est scripté. Il reconnaît ce que vous demandez (des mots, et des familles de techniques comme le jeu de rôle, la traduction, la fausse autorité), et le script décide de ce qu’il dit et de ce qu’il lâche. C’est ce qui rend une mission juste et rejouable.</p>
<h3>En option : votre propre clé API Anthropic</h3>
<p>Dans les réglages, vous pouvez donner votre clé et activer, une par une, deux aides, chacune avec son modèle et une estimation de coût :</p>
<ul>
  <li><b>Comprendre mes messages</b> : un modèle reconnaît ce que vous voulez dire même tourné librement, dans une autre langue ou avec des fautes. Il ne peut désigner que ce que le personnage écoute déjà, jamais inventer un mot de passe à trouver.</li>
  <li><b>Reformuler les répliques</b> : un modèle redit avec ses mots la réplique choisie par le script. Il ne voit jamais un secret avant que le script ait décidé de le révéler, et au moindre doute la réplique du script est utilisée.</li>
</ul>
<p>La clé reste dans votre navigateur (stockage de session, ou stockage local si vous le demandez), jamais dans la sauvegarde. Les appels partent directement de votre navigateur vers <code>api.anthropic.com</code>, avec un plafond par usage. Sans clé, le jeu ne fait aucune requête extérieure.</p>`,
    },
    {
      id: 'community-play',
      title: 'Missions de la communauté',
      body: `
<p>Sur l’écran titre, <i>Missions de la communauté</i> liste les missions écrites par des joueurs et publiées depuis le dépôt <a href="${PACKS}">breach-game/packs</a>.</p>
<ul>
  <li>Le catalogue est signé (ECDSA P-256). Le jeu vérifie la signature avec une clé intégrée, puis l’empreinte SHA-256 de chaque pack avant de le lire.</li>
  <li>Chaque pack communautaire est passé par le même validateur que les missions officielles : domaines réservés uniquement, aucun code, une solution qui termine la mission dans chaque langue déclarée.</li>
  <li>Chaque mission communautaire a sa propre sauvegarde : elle ne touche jamais votre campagne.</li>
</ul>
<p>Le store contient aussi le contenu supplémentaire de l’équipe BREACH : quarante Dossiers écrits à partir d’incidents réels (les plus sensibles joués côté défense seulement), douze hors-série fictifs, neuf Défis en Expert seulement, une collection <i>Premiers pas</i>, et cinq parcours qui proposent un ordre à travers tout le contenu, missions officielles comprises. Une étape de parcours compte dès que vous la terminez, dans n’importe quelle sauvegarde.</p>`,
    },
    {
      id: 'create',
      title: 'Écrire votre mission',
      body: `
<p>Un pack est un dossier de fichiers YAML. Un pack <b>monde</b> décrit un réseau fictif : hôtes, fichiers, pages web, DNS, personnages. Un pack <b>mission</b> se joue dans un monde, le vôtre ou celui de NovaMind : objectifs, flags, règles, indices, guidage et débrief.</p>
<pre class="code glass"><span class="c"># un dossier par pack</span>
packs/jdoe.lost-backup/
  pack.yaml       <span class="c"># id, version, titre, auteurs, langues</span>
  mission.yaml    <span class="c"># objectifs, flags, règles, indices, débrief</span>
  i18n/en.yaml    <span class="c"># tous les textes, en anglais</span>
  i18n/fr.yaml    <span class="c"># et en français</span>
  solution.txt    <span class="c"># les commandes qui terminent la mission</span></pre>
<h3>Les règles de tout pack</h3>
<ol>
  <li><b>Aucune vraie cible</b> : domaines réservés (<code>*.test</code>, <code>*.example</code>…) et adresses privées ou de documentation uniquement.</li>
  <li><b>Des familles de failles, pas des exploits</b> : illustrer une catégorie OWASP ; rien ne doit marcher tel quel contre un vrai système.</li>
  <li><b>Toujours sous mandat</b> : l’histoire dit que le joueur est autorisé.</li>
  <li><b>Chaque attaque a sa parade</b> : le débrief explique comment empêcher ce que le joueur a fait.</li>
  <li><b>Dès 16 ans</b> : ton thriller, humour bienvenu, rien de choquant.</li>
  <li><b>Réussite déterministe</b> : les flags sont vérifiés par le moteur, jamais par un modèle.</li>
</ol>
<h3>Vérifier en local</h3>
<p>Clonez le dépôt des packs à côté du jeu, installez les dépendances du jeu, puis lancez son validateur sur vos packs. Il contrôle le schéma et les règles de sécurité, et rejoue votre solution dans chaque langue :</p>
<pre class="code glass">git clone https://github.com/breach-game/packs.git
git clone https://github.com/breach-game/breach.git
cd breach &amp;&amp; pnpm install
pnpm --silent --filter @breach/pack-cli run cli check "$PWD/../packs/packs" --community --with "$PWD/content"</pre>
<p>Ouvrez ensuite une pull request. La CI refait les mêmes contrôles, un mainteneur relit l’histoire et la leçon, et la fusion publie votre mission dans le catalogue signé.</p>
<p><a class="btn ghost" href="${GUIDE}">Le guide complet (en anglais) →</a> <a class="btn ghost" href="${WORKFLOW}">Le circuit de publication →</a></p>`,
    },
    {
      id: 'privacy',
      title: 'Sécurité et vie privée',
      body: `
<p>BREACH n’envoie jamais un seul paquet à une machine du monde du jeu : ces machines n’existent pas. Les commandes sont un moteur de jeu écrit en TypeScript qui tourne dans votre onglet. Le navigateur du jeu dessine les pages à partir de données, ne charge aucune URL et ne suit aucun vrai lien.</p>
<table class="cmds">
  <thead><tr><th>Requête</th><th>Destination</th><th>Quand</th></tr></thead>
  <tbody>
    <tr><td>Jeu, polices, missions</td><td>l’origine du site</td><td>au chargement, puis en cache</td></tr>
    <tr><td>Catalogue de la communauté</td><td><code>breach-game.github.io/packs/</code></td><td>à l’ouverture des missions de la communauté</td></tr>
    <tr><td>Aide d’un modèle</td><td><code>api.anthropic.com</code></td><td>seulement avec votre clé, pour les usages activés</td></tr>
  </tbody>
</table>
<p>La politique de sécurité du contenu (CSP) du jeu n’autorise que ces destinations. Aucune mesure d’audience, aucun cookie, aucun script tiers dans le jeu. Ce site de présentation compte ses visites avec une instance auto-hébergée d’<a href="https://umami.is/">Umami</a> : aucun cookie, aucune donnée personnelle, et rien n’est compté si votre navigateur envoie Do Not Track. Le modèle de sécurité complet, et comment signaler un problème, sont dans <a href="https://github.com/breach-game/breach/blob/main/SECURITY.md">SECURITY.md</a>.</p>`,
    },
    {
      id: 'faq',
      title: 'Questions fréquentes',
      body: `
<h3>BREACH apprend-il à pirater pour de vrai ?</h3>
<p>Il apprend comment fonctionnent les attaques et comment s’en défendre : reconnaissance, secrets dans l’historique Git, ingénierie sociale, injection de prompt, agents trop puissants, mouvement latéral. Il ne fournit aucun exploit utilisable : les failles sont des familles, illustrées sur une entreprise fictive.</p>
<h3>Est-ce légal ?</h3>
<p>Oui. Rien ne quitte votre navigateur vers le monde du jeu, et chaque cible est inventée. Le jeu rappelle d’ailleurs qu’attaquer un vrai système sans autorisation écrite est un délit.</p>
<h3>Pour qui ?</h3>
<p>Toute personne de 16 ans et plus curieuse de sécurité et d’IA : étudiants, développeurs, équipes qui découvrent les risques des LLM, classes. Le niveau Guidé ne demande aucune connaissance préalable.</p>
<h3>C’est gratuit ?</h3>
<p>Oui, et open source. L’aide optionnelle d’un modèle utilise votre propre clé API, facturée par son fournisseur.</p>
<h3>Peut-on l’utiliser en cours ?</h3>
<p>Oui : il tourne dans tout navigateur récent, sans compte, et chaque mission se termine par un débrief qui fait une discussion toute prête. On peut aussi écrire des missions pour un cours et les partager comme packs communautaires.</p>`,
    },
  ],
};
