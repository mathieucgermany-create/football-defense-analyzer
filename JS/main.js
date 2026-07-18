/* ══════════════════════════════════════════════════════════════
   FOOTBALL DEFENSE ANALYZER — main.js
   Architecture modulaire inspirée des principes SOLID
   ══════════════════════════════════════════════════════════════

   Chaque bloc ci-dessous a UNE responsabilité (SRP) et n'accède
   jamais directement aux données internes d'un autre bloc — ils
   communiquent via des fonctions publiques uniquement.

     CompetitionRepository  → source de vérité des données (S)
     ProxyDataGenerator     → génère des données d'estimation (S)
     DataProvider           → abstraction entre UI et données (D)
     TacticalRules          → règles d'analyse extensibles (O)
     Renderer                → génère le HTML, une fonction par bloc (S)
     UIController             → orchestre le DOM et les événements (S)
     GridAnimation           → animation canvas du hero (S)
     ScrollReveal             → apparition au scroll (S)
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     1. COMPETITION REPOSITORY
     Responsabilité unique : stocker et exposer le catalogue de
     compétitions/équipes. Personne d'autre ne touche à CAT ou
     REAL_DATA directement.
  ════════════════════════════════════════════════════════════ */
  const CompetitionRepository = (function () {
    const CAT = [
      { league: "La Liga", season: "2020/2021", n: 35, teams: ["Athletic Club","Atlético Madrid","Barcelona","Cádiz","Celta Vigo","Deportivo Alavés","Elche","Getafe","Granada","Huesca","Levante UD","Osasuna","Real Betis","Real Madrid","Real Sociedad","Real Valladolid","Sevilla","Valencia","Villarreal"] },
      { league: "La Liga", season: "2019/2020", n: 33, teams: ["Athletic Club","Atlético Madrid","Barcelona","Celta Vigo","Deportivo Alavés","Eibar","Espanyol","Getafe","Granada","Leganés","Levante UD","Mallorca","Osasuna","Real Betis","Real Madrid","Real Sociedad","Real Valladolid","Sevilla","Valencia","Villarreal"] },
      { league: "La Liga", season: "2018/2019", n: 34, teams: ["Athletic Club","Atlético Madrid","Barcelona","Celta Vigo","Deportivo Alavés","Eibar","Espanyol","Getafe","Girona","Huesca","Leganés","Levante UD","Rayo Vallecano","Real Betis","Real Madrid","Real Sociedad","Real Valladolid","Sevilla","Valencia","Villarreal"] },
      { league: "La Liga", season: "2017/2018", n: 36, teams: ["Athletic Club","Atlético Madrid","Barcelona","Celta Vigo","Deportivo Alavés","Eibar","Espanyol","Getafe","Girona","Las Palmas","Leganés","Levante UD","Málaga","RC Deportivo La Coruña","Real Betis","Real Madrid","Real Sociedad","Sevilla","Valencia","Villarreal"] },
      { league: "La Liga", season: "2016/2017", n: 34, teams: ["Athletic Club","Atlético Madrid","Barcelona","Celta Vigo","Deportivo Alavés","Eibar","Espanyol","Granada","Las Palmas","Leganés","Málaga","Osasuna","RC Deportivo La Coruña","Real Betis","Real Madrid","Real Sociedad","Sevilla","Sporting Gijón","Valencia","Villarreal"] },
      { league: "Bundesliga", season: "2023/2024", n: 34, teams: ["Augsburg","Bayer Leverkusen","Bayern Munich","Bochum","Borussia Dortmund","Borussia Mönchengladbach","Darmstadt 98","Eintracht Frankfurt","FC Heidenheim","FC Köln","FSV Mainz 05","Freiburg","Hoffenheim","RB Leipzig","Union Berlin","VfB Stuttgart","Werder Bremen","Wolfsburg"] },
      { league: "Bundesliga", season: "2015/2016", n: 34, teams: ["Augsburg","Bayer Leverkusen","Bayern Munich","Borussia Dortmund","Borussia Mönchengladbach","Darmstadt 98","Eintracht Frankfurt","FC Köln","FSV Mainz 05","Hamburger SV","Hannover 96","Hertha Berlin","Hoffenheim","Ingolstadt","Schalke 04","VfB Stuttgart","Werder Bremen","Wolfsburg"] },
      { league: "Premier League", season: "2015/2016", n: 38, teams: ["AFC Bournemouth","Arsenal","Aston Villa","Chelsea","Crystal Palace","Everton","Leicester City","Liverpool","Manchester City","Manchester United","Newcastle United","Norwich City","Southampton","Stoke City","Sunderland","Swansea City","Tottenham Hotspur","Watford","West Bromwich Albion","West Ham United"] },
      { league: "Ligue 1", season: "2022/2023", n: 32, teams: ["AC Ajaccio","AS Monaco","Angers","Auxerre","Clermont Foot","Lens","Lille","Lorient","Lyon","Montpellier","Nantes","OGC Nice","Olympique de Marseille","Paris Saint-Germain","Rennes","Stade Brestois","Stade de Reims","Strasbourg","Toulouse","Troyes"] },
      { league: "Ligue 1", season: "2021/2022", n: 26, teams: ["AS Monaco","Bordeaux","Clermont Foot","Lens","Lille","Lorient","Lyon","Metz","Montpellier","Nantes","OGC Nice","Olympique de Marseille","Paris Saint-Germain","Rennes","Saint-Étienne","Stade de Reims","Strasbourg","Troyes"] },
      { league: "Serie A", season: "2015/2016", n: 38, teams: ["AC Milan","AS Roma","Atalanta","Bologna","Carpi","Chievo","Empoli","Fiorentina","Frosinone","Genoa","Hellas Verona","Inter Milan","Juventus","Lazio","Napoli","Palermo","Sampdoria","Sassuolo","Torino","Udinese"] },
      { league: "FIFA World Cup", season: "2018", n: 7, teams: ["Argentina","Australia","Belgium","Brazil","Colombia","Costa Rica","Croatia","Denmark","Egypt","England","France","Germany","Iceland","Iran","Japan","Mexico","Morocco","Nigeria","Panama","Peru","Poland","Portugal","Russia","Saudi Arabia","Senegal","Serbia","South Korea","Spain","Sweden","Switzerland","Tunisia","Uruguay"] },
      { league: "FIFA World Cup", season: "2022", n: 7, teams: ["Argentina","Australia","Belgium","Brazil","Cameroon","Canada","Costa Rica","Croatia","Denmark","Ecuador","England","France","Germany","Ghana","Iran","Japan","Mexico","Morocco","Netherlands","Poland","Portugal","Qatar","Saudi Arabia","Senegal","Serbia","South Korea","Spain","Switzerland","Tunisia","United States","Uruguay","Wales"] }
    ];

    // Données réelles StatsBomb (notebooks 03→08). Clé = "Ligue|Saison|Équipe"
    const REAL_DATA = {
      "La Liga|2020/2021|Barcelona": {
        xga: 33.62, xga_pm: 0.96, shots: 290, buts: 33, lb_rate: 26, losses_pm: 15.5, ppda: 2.77,
        zones: {
          "Surface centrale":  { xga: 26.48, shots: 136, pct: 79 },
          "Half-space gauche": { xga: 2.10,  shots: 31,  pct: 6 },
          "Half-space droit":  { xga: 2.30,  shots: 28,  pct: 7 },
          "Couloir gauche":    { xga: 0.80,  shots: 22,  pct: 2 },
          "Couloir droit":     { xga: 0.90,  shots: 19,  pct: 3 },
          "Zone distante":     { xga: 1.04,  shots: 54,  pct: 3 }
        },
        pressing: "haut", auc: 0.76, brier: 0.075
      }
    };

    return {
      getLeagues() {
        return [...new Set(CAT.map(c => c.league))];
      },
      getSeasons(league) {
        return CAT.filter(c => c.league === league).map(c => c.season);
      },
      getCompetition(league, season) {
        return CAT.find(c => c.league === league && c.season === season) || null;
      },
      getTeamsSorted(league, season) {
        const comp = this.getCompetition(league, season);
        return comp ? [...comp.teams].sort() : [];
      },
      getRealData(league, season, team) {
        return REAL_DATA[`${league}|${season}|${team}`] || null;
      }
    };
  })();

  /* ════════════════════════════════════════════════════════════
     2. PROXY DATA GENERATOR
     Responsabilité unique : générer des données d'estimation
     plausibles pour les équipes sans données réelles précalculées.
     Ne connaît rien du DOM ni du rendu HTML.
  ════════════════════════════════════════════════════════════ */
  const ProxyDataGenerator = {
    generate(team, comp) {
      const seed = team.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const rnd = (mn, mx, s = 0) => mn + ((seed + s * 17) % (mx - mn + 1));

      const n = Math.min(comp.n, 38);
      const xga = rnd(18, 50, 1);
      const shots = rnd(170, 380, 2);
      const buts = rnd(Math.floor(xga * 0.7), Math.ceil(xga * 1.2), 3);
      const ppda = rnd(3, 16, 4);
      const lb = rnd(15, 38, 5);
      const lpm = rnd(9, 20, 6);

      const s_xga = +(xga * 0.78).toFixed(1);
      const hs_g = +(xga * 0.065).toFixed(1);
      const hs_d = +(xga * 0.075).toFixed(1);
      const c_g = +(xga * 0.03).toFixed(1);
      const c_d = +(xga * 0.03).toFixed(1);
      const dist = +(xga - (s_xga + hs_g + hs_d + c_g + c_d)).toFixed(1);

      return {
        xga, xga_pm: +(xga / n).toFixed(2), shots, buts,
        lb_rate: lb, losses_pm: lpm, ppda,
        pressing: ppda < 7 ? 'haut' : ppda > 13 ? 'bas' : 'modéré',
        auc: null, brier: null,
        zones: {
          "Surface centrale":  { xga: s_xga, shots: Math.round(shots * 0.47), pct: 78 },
          "Half-space gauche": { xga: hs_g,  shots: Math.round(shots * 0.11), pct: 6 },
          "Half-space droit":  { xga: hs_d,  shots: Math.round(shots * 0.1),  pct: 7 },
          "Couloir gauche":    { xga: c_g,   shots: Math.round(shots * 0.08), pct: 3 },
          "Couloir droit":     { xga: c_d,   shots: Math.round(shots * 0.07), pct: 3 },
          "Zone distante":     { xga: Math.max(0, dist), shots: Math.round(shots * 0.17), pct: 3 }
        }
      };
    }
  };

  /* ════════════════════════════════════════════════════════════
     3. DATA PROVIDER — point d'inversion de dépendance (D)
     UIController appelle UNIQUEMENT DataProvider.getTeamData().
     Il ignore totalement si la donnée vient de REAL_DATA, d'un
     proxy généré, ou (demain) d'un fetch() vers une vraie API.
     → Pour brancher une vraie API plus tard, on modifie CETTE
       fonction seule, rien ailleurs dans le code ne change.
  ════════════════════════════════════════════════════════════ */
  const DataProvider = {
    getTeamData(league, season, team, comp) {
      const real = CompetitionRepository.getRealData(league, season, team);
      if (real) return real;
      return ProxyDataGenerator.generate(team, comp);
    }
  };

  /* ════════════════════════════════════════════════════════════
     4. TACTICAL RULES — moteur de règles extensible (O)
     Ajouter un nouveau critère d'analyse = ajouter un objet dans
     STRENGTH_WEAKNESS_RULES ou RECOMMENDATION_RULES. On ne touche
     JAMAIS à la logique de la fonction analyze()/recommend().
  ════════════════════════════════════════════════════════════ */
  const TacticalRules = (function () {
    // Chaque règle reçoit les données (d) et retourne
    // { type: 'force'|'weakness', text: '...' }
    const STRENGTH_WEAKNESS_RULES = [
      d => {
        if (d.xga_pm < 0.8) return { type: 'force', text: `xGA encaissé très faible (${d.xga_pm}/match) — parmi les meilleures défenses de la compétition` };
        if (d.xga_pm > 1.2) return { type: 'weakness', text: `xGA encaissé élevé (${d.xga_pm}/match) — exposition défensive préoccupante sur la saison` };
        return { type: 'force', text: `xGA encaissé modéré (${d.xga_pm}/match) — niveau de solidité défensive acceptable` };
      },
      d => {
        if (d.ppda < 7) return { type: 'force', text: `Pressing très intense (PPDA=${d.ppda}) — harcèlement haut coordonné et efficace` };
        if (d.ppda > 13) return { type: 'weakness', text: `Pressing passif (PPDA=${d.ppda}) — bloc bas qui concède l'initiative à l'adversaire` };
        return { type: 'force', text: `Pressing équilibré (PPDA=${d.ppda}) — ni bloc bas ni pressing trop exposé` };
      },
      d => {
        if (d.lb_rate < 20) return { type: 'force', text: `Ligne défensive solide — seulement ${d.lb_rate}% des Key Passes adverses la franchissent` };
        if (d.lb_rate > 30) return { type: 'weakness', text: `Ligne régulièrement franchie (LBR ${d.lb_rate}%) — vulnérabilité marquée sur les transitions` };
        return { type: 'weakness', text: `Line-Break Rate moyen (${d.lb_rate}%) — marge de progression sur la compacité du bloc` };
      },
      d => {
        if (d.losses_pm < 11) return { type: 'force', text: `Pertes critiques limitées (${d.losses_pm}/match) — bonne maîtrise en relance` };
        if (d.losses_pm > 16) return { type: 'weakness', text: `Nombreuses pertes critiques (${d.losses_pm}/match) — exposition aux contre-attaques` };
        return { type: 'weakness', text: `Pertes critiques à surveiller (${d.losses_pm}/match) — couloirs latéraux exposés au pressing` };
      }
    ];

    // Chaque règle retourne soit null (ne s'applique pas), soit {t, d}
    const RECOMMENDATION_RULES = [
      d => d.lb_rate > 24
        ? { t: 'BLOC DÉFENSIF', d: `Line-Break Rate de ${d.lb_rate}% : renforcer la compacité axiale sur les transitions. Exercice : repli défensif organisé à la perte.` }
        : null,
      d => d.ppda > 11
        ? { t: 'PRESSING', d: `PPDA de ${d.ppda} signale un pressing trop relâché. Travailler le pressing haut coordonné depuis les attaquants pour réduire sous 8.` }
        : null,
      d => d.losses_pm > 13
        ? { t: 'TRANSITIONS', d: `${d.losses_pm} pertes critiques par match. Sécuriser les relances courtes et prévoir une sentinelle de couverture.` }
        : null,
      // Toujours affichée en dernier recours (pas de condition)
      d => ({ t: 'SURFACE CENTRALE', d: `${d.zones["Surface centrale"].pct}% du xGA encaissé provient de la surface. Priorité : densité axiale dans les 18m et marquage proactif.` })
    ];

    return {
      analyze(d) {
        const results = STRENGTH_WEAKNESS_RULES.map(rule => rule(d));
        return {
          F: results.filter(r => r.type === 'force').map(r => r.text).slice(0, 4),
          W: results.filter(r => r.type === 'weakness').map(r => r.text).slice(0, 4)
        };
      },
      recommend(d) {
        return RECOMMENDATION_RULES
          .map(rule => rule(d))
          .filter(Boolean)
          .slice(0, 4);
      }
    };
  })();

  /* ════════════════════════════════════════════════════════════
     5. RENDERER — génération HTML, une fonction par bloc (S)
     Chaque render*() ne fait qu'UNE chose : transformer des
     données en fragment HTML. Aucune n'accède au DOM ni ne
     déclenche d'effet de bord.
  ════════════════════════════════════════════════════════════ */
  const Renderer = {
    renderHead(team, comp, d, isReal) {
      const pressLabel = d.ppda < 7 ? 'PRESSING HAUT' : d.ppda > 13 ? 'BLOC BAS' : 'PRESSING MODÉRÉ';
      return `
        <div class="rpt-head">
          <div>
            <div class="rpt-title">Rapport défensif — ${team}</div>
            <div class="rpt-meta">${comp.league} · ${comp.season} · ${comp.n} matchs analysés${isReal ? ' · Données StatsBomb réelles' : ' · Estimation Modèle Proxy'}</div>
          </div>
          <div class="rpt-badges">
            <span class="badge cyan">${pressLabel}</span>
            ${isReal ? `<span class="badge green">AUC=${d.auc}</span>` : ''}
            ${isReal ? '<span class="badge">RÉEL</span>' : '<span class="badge">PROXY</span>'}
          </div>
        </div>`;
    },

    renderKPIs(d) {
      const xga_cls = d.xga_pm < 0.8 ? 'g' : d.xga_pm > 1.2 ? 'r' : 'o';
      const ppda_cls = d.ppda < 7 ? 'g' : d.ppda > 13 ? 'r' : '';
      const lb_cls = d.lb_rate < 20 ? 'g' : d.lb_rate > 30 ? 'r' : 'o';
      return `
        <div class="kpi-row">
          <div class="kpi-box"><span class="kpi-v ${xga_cls}">${d.xga_pm}</span><span class="kpi-l">xGA / Match</span></div>
          <div class="kpi-box"><span class="kpi-v">${d.shots}</span><span class="kpi-l">Tirs concédés</span></div>
          <div class="kpi-box"><span class="kpi-v ${ppda_cls}">${d.ppda}</span><span class="kpi-l">PPDA Pressing</span></div>
          <div class="kpi-box"><span class="kpi-v ${lb_cls}">${d.lb_rate}%</span><span class="kpi-l">Line-Break Rate</span></div>
        </div>`;
    },

    renderZones(d) {
      const maxXga = Math.max(...Object.values(d.zones).map(z => z.xga));
      const zonesHTML = Object.entries(d.zones).map(([name, z]) => `
        <div class="zone-cell">
          <div class="zone-name">${name}</div>
          <div class="zone-xga">${z.xga}<span style="font-size:0.8rem;color:var(--text-muted);"> xGA</span></div>
          <div class="zone-sub">${z.shots} tirs · ${z.pct}%</div>
          <div class="bar"><div class="bar-fill" data-w="${Math.round(z.xga / maxXga * 100)}" style="width:0%"></div></div>
        </div>`).join('');
      return `
        <span class="rpt-section-label">xGA par zone tactique</span>
        <div class="zones">${zonesHTML}</div>`;
    },

    renderSWOT(sw) {
      const forcesHTML = sw.F.map(f => `<div class="swot-item"><div class="dot f"></div><span>${f}</span></div>`).join('');
      const wHTML = sw.W.map(w => `<div class="swot-item"><div class="dot w"></div><span>${w}</span></div>`).join('');
      return `
        <span class="rpt-section-label">Forces &amp; Faiblesses</span>
        <div class="swot">
          <div class="swot-cell"><div class="swot-title f">✦ POINTS FORTS</div>${forcesHTML}</div>
          <div class="swot-cell"><div class="swot-title w">✦ VULNÉRABILITÉS</div>${wHTML}</div>
        </div>`;
    },

    renderRecommendations(recos) {
      const rcHTML = recos.map((r, i) => `
        <div class="reco">
          <div class="reco-n">0${i + 1}</div>
          <div><div class="reco-t">${r.t}</div><div class="reco-d">${r.d}</div></div>
        </div>`).join('');
      return `
        <span class="rpt-section-label" style="margin-top:1.5rem">Recommandations tactiques</span>
        <div class="recos">${rcHTML}</div>`;
    },

    renderFooter(isReal) {
      return `
        <div class="rpt-foot">
          Données : StatsBomb Open Data (CC BY-SA 4.0)${isReal ? ' · Valeurs calculées depuis les notebooks 03→08' : ' · Exécuter le pipeline Python pour générer les données exactes.'}
        </div>`;
    },

    // Compose le rapport complet à partir des blocs ci-dessus.
    // Si un jour on veut ajouter une section, on ajoute une ligne
    // ici sans toucher aux fonctions existantes (Open/Closed).
    renderFullReport(team, comp, d) {
      const isReal = !!d.auc;
      const sw = TacticalRules.analyze(d);
      const recos = TacticalRules.recommend(d);

      return [
        this.renderHead(team, comp, d, isReal),
        this.renderKPIs(d),
        this.renderZones(d),
        this.renderSWOT(sw),
        this.renderRecommendations(recos),
        this.renderFooter(isReal)
      ].join('\n');
    }
  };

  /* ════════════════════════════════════════════════════════════
     6. UI CONTROLLER
     Responsabilité unique : orchestrer le DOM et les événements.
     Ne contient AUCUNE logique métier — délègue à DataProvider,
     TacticalRules et Renderer. Références DOM mises en cache une
     seule fois pour éviter les appels getElementById répétés.
  ════════════════════════════════════════════════════════════ */
  const UIController = (function () {
    let els = {};

    function cacheElements() {
      els = {
        league: document.getElementById('sel-league'),
        season: document.getElementById('sel-season'),
        team:   document.getElementById('sel-team'),
        btnRun: document.getElementById('btn-run'),
        idle:   document.getElementById('az-idle'),
        out:    document.getElementById('az-out'),
        prog:   document.getElementById('prog')
      };
    }

    function fillSelect(select, values, placeholder) {
      select.innerHTML = `<option value="">${placeholder}</option>`;
      values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
    }

    function resetDownstream(...selects) {
      selects.forEach(s => { s.disabled = true; });
    }

    function setLoadingState(isLoading) {
      if (isLoading) {
        els.idle.style.display = 'none';
        els.out.style.display = 'none';
        els.prog.className = 'prog on';
      } else {
        els.prog.className = 'prog';
        els.out.style.display = 'block';
      }
    }

    function animateZoneBars() {
      setTimeout(() => {
        document.querySelectorAll('.bar-fill[data-w]').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      }, 100);
    }

    function initLeagueOptions() {
      fillSelect(els.league, CompetitionRepository.getLeagues(), '— Sélectionner —');
    }

    function onLeagueChange() {
      resetDownstream(els.season, els.team, els.btnRun);
      const league = els.league.value;
      if (!league) {
        fillSelect(els.season, [], '— Sélectionner —');
        fillSelect(els.team, [], '— Choisir saison —');
        return;
      }
      fillSelect(els.season, CompetitionRepository.getSeasons(league), '— Sélectionner —');
      els.season.disabled = false;
    }

    function onSeasonChange() {
      resetDownstream(els.team, els.btnRun);
      const league = els.league.value;
      const season = els.season.value;
      if (!season) {
        fillSelect(els.team, [], '— Sélectionner une équipe —');
        return;
      }
      fillSelect(els.team, CompetitionRepository.getTeamsSorted(league, season), '— Sélectionner une équipe —');
      els.team.disabled = false;
      els.team.onchange = () => { els.btnRun.disabled = (els.team.value === ''); };
    }

    function runAnalysis() {
      const league = els.league.value;
      const season = els.season.value;
      const team = els.team.value;
      if (!league || !season || !team) return;

      const comp = CompetitionRepository.getCompetition(league, season);
      if (!comp) return;

      setLoadingState(true);

      // Délai artificiel pour l'effet "calcul en cours"
      setTimeout(() => {
        const data = DataProvider.getTeamData(league, season, team, comp);
        els.out.innerHTML = Renderer.renderFullReport(team, comp, data);
        setLoadingState(false);
        animateZoneBars();
      }, 1200);
    }

    return {
      init() {
        cacheElements();
        if (!els.league) return; // page sans analyseur (ex: lexique.html)
        initLeagueOptions();
      },
      onLeagueChange,
      onSeasonChange,
      runAnalysis
    };
  })();

  /* ════════════════════════════════════════════════════════════
     7. GRID ANIMATION — canvas décoratif du hero
  ════════════════════════════════════════════════════════════ */
  const GridAnimation = {
    init() {
      const cv = document.getElementById('grid-canvas');
      if (!cv) return;
      const ctx = cv.getContext('2d');
      let W, H, raf;

      function resize() {
        W = cv.width = window.innerWidth;
        H = cv.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      function draw(ts) {
        ctx.clearRect(0, 0, W, H);
        const off = (ts * 0.00015) % 1;
        const hz = H * 0.55;

        ctx.strokeStyle = '#00D2FF';
        ctx.lineWidth = 0.8;

        for (let i = 0; i <= 14; i++) {
          const t = i / 14;
          const x0 = W * t;
          const x1 = W / 2 + (x0 - W / 2) * 0.001;
          ctx.globalAlpha = 0.4 * (1 - Math.abs(t - 0.5) * 1.5);
          ctx.beginPath();
          ctx.moveTo(x1, hz);
          ctx.lineTo(x0, H);
          ctx.stroke();
        }

        for (let i = 0; i <= 20; i++) {
          const t = ((i / 20) + off) % 1;
          const e = t * t;
          const y = hz + (H - hz) * e;
          const xL = W / 2 - (W / 2) * e;
          const xR = W / 2 + (W - W / 2) * e;
          ctx.globalAlpha = e * 0.5;
          ctx.beginPath();
          ctx.moveTo(xL, y);
          ctx.lineTo(xR, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      }

      raf = requestAnimationFrame(draw);

      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) raf = requestAnimationFrame(draw);
        else cancelAnimationFrame(raf);
      }, { threshold: 0 }).observe(cv);
    }
  };

  /* ════════════════════════════════════════════════════════════
     8. SCROLL REVEAL — apparition progressive au défilement
  ════════════════════════════════════════════════════════════ */
  const ScrollReveal = {
    init() {
      document.querySelectorAll('.reveal').forEach(el => {
        new IntersectionObserver(([e], observer) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        }, { threshold: 0.1 }).observe(el);
      });
    }
  };

  /* ════════════════════════════════════════════════════════════
     BOOTSTRAP
     Seul point d'entrée. Expose au HTML uniquement les 3 fonctions
     dont il a besoin (onclick="..."), rien d'autre ne pollue le
     scope global (window).
  ════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
    GridAnimation.init();
    ScrollReveal.init();
  });

  window.onLeagueChange = () => UIController.onLeagueChange();
  window.onSeasonChange = () => UIController.onSeasonChange();
  window.run = () => UIController.runAnalysis();

})();