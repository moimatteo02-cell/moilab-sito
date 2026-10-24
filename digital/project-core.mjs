export const projectServices=['Sito web','Applicazione','E-commerce','Automazione','Non sono sicuro'];
export const serviceKeys=['web','blocks','shop','nodes','case'];
export const projectObjectives=[
 {key:'clients',label:'Trovare nuovi clienti'},
 {key:'cart',label:'Vendere online'},
 {key:'calendar',label:'Organizzare il lavoro'},
 {key:'clock',label:'Risparmiare tempo'},
 {key:'growth',label:'Migliorare un servizio'}
];
export const projectFeatures={
 'Sito web':['Presentazione attività','Catalogo o portfolio','Richieste di preventivo','Prenotazioni','Più lingue'],
 'Applicazione':['Agenda e prenotazioni','Clienti e contatti','Ordini e preventivi','Area riservata','Dashboard e statistiche'],
 'E-commerce':['Catalogo e varianti','Pagamenti online','Spedizioni o ritiro','Promozioni','Gestione ordini'],
 'Automazione':['Messaggi e promemoria','Sincronizzazione dati','Documenti e preventivi','Integrazione tra strumenti','Report automatici'],
 'Non sono sicuro':projectObjectives.map(o=>o.label)
};
export const emptyProject=()=>({business:'',sector:'',website:'',service:'',objective:'',goal:'',features:[],tools:'',materials:'Da definire',deadline:'Da concordare',budget:'Da definire',notes:'',name:'',phone:'',email:''});
const clean=v=>String(v||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim();
export function projectSummary(p){return [
 ['Attività',p.business],['Settore',p.sector],['Sito attuale',p.website],['Progetto',p.service],['Obiettivo scelto',p.objective],['Obiettivo',p.goal],
 ['Funzioni',p.features?.join(', ')||'Da valutare insieme'],['Strumenti / riferimenti',p.tools],['Contenuti disponibili',p.materials],
 ['Tempistiche',p.deadline],['Budget indicativo',p.budget],['Altre informazioni',p.notes],['Referente',p.name],['Telefono',p.phone],['Email',p.email]
].map(([label,value])=>[label,clean(value)]).filter(([,v])=>v)}
export function projectMessage(p){return 'Ciao MOI LAB! Vorrei parlare di un progetto Digital.\n\n'+projectSummary(p).map(([label,value])=>label+': '+value).join('\n\n')+'\n\nVorrei valutare con voi la soluzione e ricevere un preventivo.'}
export function projectWhatsApp(p){return 'https://wa.me/393278815148?text='+encodeURIComponent(projectMessage(p))}

// Semantic artwork for every existing choice; labels and submitted values stay unchanged.
export const featureIconKeys={
 'Sito web':['web','case','document','calendar','globe'],
 'Applicazione':['calendar','people','document','lock','growth'],
 'E-commerce':['shop','cart','case','growth','document'],
 'Automazione':['message','nodes','document','nodes','growth'],
 'Non sono sicuro':projectObjectives.map(o=>o.key)
};
