/* Atelier Pivoine — à l'heure de Paris : pancarte ouverte ou fermée, livraison du jour,
   frise des horaires, mois de l'almanach et prochaine fête. Plan Google chargé à la demande.
   Sans JavaScript, la page reste complète : horaires, almanach et contact sont dans le HTML. */
(function () {
  // Plages en minutes depuis minuit. 0 = dimanche.
  var HORAIRES = {
    0: [[540, 750]],
    1: [],
    2: [[540, 750], [840, 1140]],
    3: [[540, 750], [840, 1140]],
    4: [[540, 750], [840, 1140]],
    5: [[540, 750], [840, 1140]],
    6: [[540, 750], [840, 1170]]
  };
  var JOURS_LIVRAISON = [2, 3, 4, 5, 6];
  var LIMITE_LIVRAISON = 720; // midi : livré l'après-midi même
  var FRISE = [480, 1200];    // la frise des horaires va de 8 h à 20 h
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JOUR = 86400000;
  var NBSP = " ";

  function maintenantParis() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", year: "numeric", month: "numeric", day: "numeric",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var v = {};
    parts.forEach(function (p) { v[p.type] = p.value; });
    return {
      jour: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v.weekday),
      annee: +v.year, mois: +v.month, date: +v.day,
      min: +v.hour * 60 + +v.minute
    };
  }

  function heure(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + NBSP + "h" + (m ? NBSP + String(m).padStart(2, "0") : "");
  }

  function duree(min) {
    return min < 60 ? min + NBSP + "min" : heure(min);
  }

  // Ouvert, bientôt fermé (30 min) ou fermé, avec la prochaine ouverture.
  function etat(t) {
    var plage = null;
    HORAIRES[t.jour].forEach(function (p) { if (t.min >= p[0] && t.min < p[1]) plage = p; });
    if (plage) {
      var reste = plage[1] - t.min;
      return { etat: reste <= 30 ? "bientot" : "ouvert", fin: plage[1], reste: reste };
    }
    for (var i = 0; i < 8; i++) {
      var j = (t.jour + i) % 7, plages = HORAIRES[j];
      for (var k = 0; k < plages.length; k++) {
        if (i === 0 && t.min >= plages[k][0]) continue;
        return { etat: "ferme", dans: i, jour: j, debut: plages[k][0], attente: i === 0 ? plages[k][0] - t.min : null };
      }
    }
    return { etat: "ferme", dans: 0, jour: t.jour, debut: 0, attente: null };
  }

  // « à 14 h », « demain à 9 h », « mardi à 9 h »
  function quand(e) {
    return (e.dans === 0 ? "" : e.dans === 1 ? "demain " : JOURS[e.jour] + " ") + "à " + heure(e.debut);
  }

  function majPancarte(e) {
    var el = document.querySelector("[data-pancarte]");
    if (!el) return;
    var mot = el.querySelector("[data-pancarte-mot]");
    var detail = el.querySelector("[data-pancarte-detail]");
    el.classList.remove("pancarte--ouvert", "pancarte--bientot", "pancarte--ferme");
    el.classList.add("pancarte--" + e.etat);
    if (e.etat === "ferme") {
      mot.textContent = "Fermé";
      detail.textContent = "On revient " + quand(e);
      // Les aiguilles de la petite horloge, comme sur le carton « je reviens à… »
      var h = Math.floor(e.debut / 60) % 12, m = e.debut % 60;
      el.querySelector(".pancarte__heures").style.transform = "rotate(" + (h * 30 + m / 2) + "deg)";
      el.querySelector(".pancarte__minutes").style.transform = "rotate(" + m * 6 + "deg)";
    } else {
      mot.textContent = "Ouvert";
      detail.textContent = (e.etat === "bientot" ? "Ferme à " : "Jusqu’à ") + heure(e.fin);
    }
    el.hidden = false;
  }

  function majCapsule(e) {
    var etatEl = document.querySelector("[data-capsule-etat]");
    var detail = document.querySelector("[data-capsule-detail]");
    if (!etatEl || !detail) return;
    etatEl.textContent = e.etat === "ferme" ? "Fermé" : e.etat === "bientot" ? "Ferme bientôt" : "Ouvert";
    detail.textContent = e.etat === "ferme" ? "ouvre " + quand(e) : (e.etat === "bientot" ? "à " : "jusqu’à ") + heure(e.fin);
  }

  // « Livré cet après-midi » tant qu'il reste du temps avant midi, sinon la prochaine tournée.
  function majLivraison(t) {
    var texte, urgent = false, reste = LIMITE_LIVRAISON - t.min;
    if (JOURS_LIVRAISON.indexOf(t.jour) > -1 && reste > 0) {
      urgent = reste <= 120;
      texte = urgent
        ? "Plus que " + duree(reste) + " pour être livré cet après-midi à Hesdin et 15" + NBSP + "km autour."
        : "Commandez avant midi" + NBSP + ": livré cet après-midi à Hesdin et 15" + NBSP + "km autour.";
    } else {
      for (var i = 1; i < 8; i++) {
        var j = (t.jour + i) % 7;
        if (JOURS_LIVRAISON.indexOf(j) > -1) {
          texte = "Prochaine tournée " + (i === 1 ? "demain" : JOURS[j]) + NBSP + ": commandez avant midi, livré l’après-midi.";
          break;
        }
      }
    }
    document.querySelectorAll("[data-livraison]").forEach(function (el) {
      el.querySelector("[data-livraison-texte]").textContent = texte;
      el.classList.toggle("livraison--urgent", urgent);
    });
  }

  // La frise de chaque jour, le jour courant et l'aiguille de l'heure.
  function majSemaine(t, e) {
    var liste = document.querySelector("[data-semaine]");
    if (!liste) return;
    var etendue = FRISE[1] - FRISE[0];
    var pct = function (min) { return Math.max(0, Math.min(100, (min - FRISE[0]) / etendue * 100)) + "%"; };

    if (!liste.classList.contains("semaine--frise")) {
      liste.querySelectorAll("[data-jour]").forEach(function (li) {
        var frise = document.createElement("span");
        frise.className = "jour__frise";
        frise.setAttribute("aria-hidden", "true");
        HORAIRES[li.getAttribute("data-jour")].forEach(function (p) {
          var plage = document.createElement("i");
          plage.className = "jour__plage";
          plage.style.setProperty("--de", pct(p[0]));
          plage.style.setProperty("--duree", (p[1] - p[0]) / etendue * 100 + "%");
          frise.appendChild(plage);
        });
        li.appendChild(frise);
      });
      liste.classList.add("semaine--frise");
    }

    liste.querySelectorAll(".jour--aujourdhui").forEach(function (li) { li.classList.remove("jour--aujourdhui"); });
    var aujourdhui = liste.querySelector('[data-jour="' + t.jour + '"]');
    var aiguille = liste.querySelector(".jour__aiguille");
    if (aujourdhui) {
      aujourdhui.classList.add("jour--aujourdhui");
      if (t.min >= FRISE[0] && t.min <= FRISE[1]) {
        if (!aiguille) {
          aiguille = document.createElement("i");
          aiguille.className = "jour__aiguille";
        }
        aiguille.style.setProperty("--maintenant", pct(t.min));
        aujourdhui.querySelector(".jour__frise").appendChild(aiguille);
      } else if (aiguille) {
        aiguille.remove();
      }
    }

    var phrase = document.querySelector("[data-maintenant]");
    if (phrase) {
      var suite;
      if (e.etat === "ferme") suite = e.attente !== null && e.attente <= 120 ? "on rouvre dans " + duree(e.attente) : "on rouvre " + quand(e);
      else suite = e.etat === "bientot" ? "on ferme dans " + duree(e.reste) : "c’est ouvert jusqu’à " + heure(e.fin);
      phrase.textContent = "Il est " + heure(t.min) + " à Hesdin · " + suite + ".";
      phrase.hidden = false;
    }
  }

  // Pâques (algorithme grégorien anonyme), pour décaler la fête des mères si elle tombe à la Pentecôte.
  function paques(an) {
    var a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var n = h + l - 7 * m + 114;
    return Date.UTC(an, Math.floor(n / 31) - 1, (n % 31) + 1);
  }

  function premierDimanche(d) { return d + ((7 - new Date(d).getUTCDay()) % 7) * JOUR; }

  function feteDesMeres(an) {
    var fin = Date.UTC(an, 4, 31);
    var d = fin - new Date(fin).getUTCDay() * JOUR;       // dernier dimanche de mai…
    return d === paques(an) + 49 * JOUR ? d + 7 * JOUR : d; // …sauf Pentecôte : premier dimanche de juin
  }

  var FETES = [
    { nom: "Saint-Valentin", date: function (an) { return Date.UTC(an, 1, 14); },
      fleur: ["renoncule", "#d93a68", "#ec7f9e", "#f7b9c9"],
      texte: "Roses, renoncules et anémones, en bouquet ou à la tige. Réservez le vôtre, on le compose le matin même." },
    { nom: "Fête des grands-mères", date: function (an) { return premierDimanche(Date.UTC(an, 2, 1)); },
      fleur: ["cosmos", "#e04f7d", "#e04f7d", "#fffaf4"],
      texte: "Jonquilles, tulipes et mimosa" + NBSP + ": un petit bouquet de saison pour elle, dès 20" + NBSP + "€." },
    { nom: "Muguet du 1er mai", date: function (an) { return Date.UTC(an, 4, 1); },
      fleur: ["marguerite", "#fffaf4", "#efe6d6", "#f3c64f"],
      texte: "Brins et pots de muguet à l’atelier dès le 30 avril, et des bouquets de printemps pour les accompagner." },
    { nom: "Fête des mères", date: feteDesMeres,
      fleur: ["pivoine", "#f3a0b5", "#f7c3cf", "#f4c94f"],
      texte: "C’est la saison des pivoines. Commandez dès maintenant" + NBSP + ": livraison possible la veille, le samedi." },
    { nom: "Toussaint", date: function (an) { return Date.UTC(an, 10, 1); },
      fleur: ["chrysantheme", "#8e2340", "#b83258", "#f4d27a"],
      texte: "Chrysanthèmes en pot dès 12" + NBSP + "€, coussins et compositions pour le cimetière, à réserver dès maintenant." },
    { nom: "Noël", date: function (an) { return Date.UTC(an, 11, 25); },
      fleur: ["dahlia", "#9b1d33", "#c8364f", "#f4d27a"],
      texte: "Couronnes de porte, centres de table, amaryllis et branchages. Commandez avant le 20 décembre." }
  ];

  function prochaineFete(t) {
    var aujourdhui = Date.UTC(t.annee, t.mois - 1, t.date), meilleure = null;
    [t.annee, t.annee + 1].forEach(function (an) {
      FETES.forEach(function (f) {
        var d = f.date(an);
        if (d >= aujourdhui && (!meilleure || d < meilleure.d)) meilleure = { f: f, d: d };
      });
    });
    meilleure.jours = Math.round((meilleure.d - aujourdhui) / JOUR);
    return meilleure;
  }

  function majAlmanach(t) {
    var liste = document.querySelector("[data-mois-liste]");
    var carte = liste && liste.querySelector('[data-mois="' + t.mois + '"]');
    if (carte) {
      carte.classList.add("mois__carte--actuel");
      // Le mois en cours en tête de la bande, sans faire défiler la page
      if (liste.scrollWidth > liste.clientWidth) {
        liste.scrollLeft += carte.getBoundingClientRect().left - liste.getBoundingClientRect().left
          - parseFloat(getComputedStyle(liste).paddingLeft);
      }
    }

    var el = document.querySelector("[data-rendezvous]");
    if (!el) return;
    var p = prochaineFete(t), d = new Date(p.d), jour = d.getUTCDate();
    var date = JOURS[d.getUTCDay()] + " " + (jour === 1 ? "1er" : jour) + " " + MOIS[d.getUTCMonth()];
    var compte = p.jours === 0 ? "Aujourd’hui" : p.jours === 1 ? "Demain" : p.jours <= 30 ? "Dans " + p.jours + " jours" : "Bientôt";
    el.querySelector("[data-rdv-quand]").textContent = compte + " · " + date;
    el.querySelector("[data-rdv-nom]").textContent = p.f.nom;
    el.querySelector("[data-rdv-texte]").textContent = p.f.texte;
    var fleur = el.querySelector("[data-rdv-fleur]");
    if (fleur) {
      fleur.querySelector("use").setAttribute("href", "#f-" + p.f.fleur[0]);
      fleur.style.cssText = "--c1:" + p.f.fleur[1] + ";--c2:" + p.f.fleur[2] + ";--c3:" + p.f.fleur[3];
    }
    el.hidden = false;
  }

  // Le plan Google ne se charge que si on le demande : rien n'est envoyé à Google avant.
  function plan() {
    var lien = document.querySelector("[data-plan-charger]");
    var cadre = document.querySelector("[data-plan-cadre]");
    if (!lien || !cadre) return;
    lien.textContent = "Afficher le plan Google Maps";
    lien.addEventListener("click", function (ev) {
      if (cadre.querySelector("iframe")) return; // déjà affiché : le lien ouvre Google Maps
      ev.preventDefault();
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=Hesdin%2062140&z=16&output=embed";
      iframe.title = "Plan Google Maps : Atelier Pivoine à Hesdin";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      cadre.replaceChildren(iframe);
      lien.textContent = "Ouvrir dans Google Maps";
    });
  }

  // La capsule arrive quand les boutons de la vitrine sortent de l'écran.
  function capsule() {
    var el = document.querySelector("[data-capsule]");
    var actions = document.querySelector("[data-actions-vitrine]");
    if (!el || !actions || !("IntersectionObserver" in window)) return;
    el.classList.add("capsule--cachee");
    new IntersectionObserver(function (entrees) {
      el.classList.toggle("capsule--cachee", entrees[0].isIntersecting);
    }).observe(actions);
  }

  function maj() {
    var t = maintenantParis();
    if (t.jour < 0) return null;
    var e = etat(t);
    document.documentElement.setAttribute("data-etat", e.etat);
    majPancarte(e);
    majCapsule(e);
    majLivraison(t);
    majSemaine(t, e);
    return t;
  }

  var t = maj();
  if (t) majAlmanach(t);
  plan();
  capsule();
  setInterval(maj, 60000);
})();
