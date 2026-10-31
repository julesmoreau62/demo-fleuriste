/* Atelier Pivoine — état d'ouverture, livraison du jour, saison et bouquet à composer, à l'heure de Paris.
   Sans JavaScript, la page reste complète : horaires, saisons et prix sont dans le HTML. */
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
  var LIMITE_LIVRAISON = 840; // 14 h
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function maintenantParis() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var v = {};
    parts.forEach(function (p) { v[p.type] = p.value; });
    var jour = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v.weekday);
    return { jour: jour, mois: parseInt(v.month, 10), min: parseInt(v.hour, 10) * 60 + parseInt(v.minute, 10) };
  }

  function heure(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + " h" + (m ? " " + String(m).padStart(2, "0") : "");
  }

  function duree(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return h + " h" + (m ? " " + String(m).padStart(2, "0") : "");
  }

  function quand(i, j) {
    return i === 0 ? "" : i === 1 ? "demain " : JOURS[j] + " ";
  }

  function prochaineOuverture(t) {
    for (var i = 0; i < 8; i++) {
      var j = (t.jour + i) % 7, plages = HORAIRES[j];
      for (var k = 0; k < plages.length; k++) {
        if (i === 0 && t.min >= plages[k][0]) continue;
        return quand(i, j) + "à " + heure(plages[k][0]);
      }
    }
    return "";
  }

  function majEtat(t) {
    var el = document.querySelector("[data-etat]");
    if (!el) return;
    var plages = HORAIRES[t.jour], plage = null, texte, classe;
    plages.forEach(function (p) { if (t.min >= p[0] && t.min < p[1]) plage = p; });
    if (plage) {
      var reste = plage[1] - t.min;
      classe = reste <= 30 ? "etat--bientot" : "etat--ouvert";
      texte = (reste <= 30 ? "Ferme bientôt · " : "Ouvert jusqu'à ") + heure(plage[1]);
    } else {
      classe = "etat--ferme";
      texte = "Fermé · ouvre " + prochaineOuverture(t);
    }
    el.className = "etat " + classe;
    el.querySelector("[data-etat-texte]").textContent = texte;
    el.hidden = false;
  }

  // « Livré aujourd'hui » tant qu'il reste du temps avant 14 h, sinon la prochaine tournée.
  function majLivraison(t) {
    var texte;
    if (JOURS_LIVRAISON.indexOf(t.jour) > -1 && t.min < LIMITE_LIVRAISON) {
      texte = "Commandez dans les " + duree(LIMITE_LIVRAISON - t.min) + " : livré aujourd'hui";
    } else {
      for (var i = 1; i < 8; i++) {
        var j = (t.jour + i) % 7;
        if (JOURS_LIVRAISON.indexOf(j) > -1) {
          texte = "Prochaine livraison " + (i === 1 ? "demain" : JOURS[j]) + ", pour une commande avant 14 h";
          break;
        }
      }
    }
    var el = document.querySelector("[data-livraison]");
    if (el) {
      el.querySelector("[data-livraison-texte]").textContent = texte;
      el.hidden = false;
    }
    var info = document.querySelector("[data-livraison-info]");
    if (info) {
      info.textContent = texte + ".";
      info.hidden = false;
    }
  }

  function majSaison(t) {
    document.querySelectorAll("[data-saisons] .saison").forEach(function (li) {
      var mois = li.getAttribute("data-mois").split(" ").map(Number);
      if (mois.indexOf(t.mois) > -1) {
        li.classList.add("saison--actuelle");
        var badge = document.createElement("span");
        badge.className = "saison__badge";
        badge.textContent = "En ce moment";
        li.querySelector(".saison__nom").appendChild(badge);
      }
    });
  }

  function majAujourdhui(t) {
    var ligne = document.querySelector('.horaires__table tr[data-jour="' + t.jour + '"]');
    if (ligne) ligne.classList.add("aujourdhui");
  }

  // Le bouquet à composer : aperçu, prix et SMS prérempli.
  function composer() {
    var form = document.querySelector("[data-composer]");
    if (!form) return;
    var apercu = form.querySelector(".atelier__apercu");
    var total = form.querySelector("[data-total]");
    var resume = form.querySelector("[data-resume]");
    var sms = form.querySelector("[data-sms]");
    var numero = sms.getAttribute("href");
    var NOMS_TONS = { doux: "tons doux", vif: "tons vifs", "champêtre": "tons champêtres", blanc: "blanc et vert" };

    function maj() {
      var taille = form.querySelector('[name="taille"]:checked');
      var tons = form.querySelector('[name="tons"]:checked');
      var vase = form.elements.vase, livraison = form.elements.livraison;
      var mot = form.elements.mot.value.trim();
      var prix = Number(taille.dataset.prix)
        + (vase.checked ? Number(vase.dataset.prix) : 0)
        + (livraison.checked ? Number(livraison.dataset.prix) : 0);

      apercu.dataset.taille = taille.value;
      apercu.dataset.tons = tons.value;

      var morceaux = [taille.value.charAt(0).toUpperCase() + taille.value.slice(1), NOMS_TONS[tons.value]];
      if (vase.checked) morceaux.push("avec vase");
      morceaux.push(livraison.checked ? "livré" : "à retirer en boutique");
      resume.textContent = morceaux.join(", ") + ".";
      total.textContent = prix + " €";

      var message = "Bonjour, je voudrais un bouquet " + taille.value + ", " + NOMS_TONS[tons.value]
        + (vase.checked ? ", avec vase" : "")
        + (livraison.checked ? ", en livraison (adresse : …)" : ", à retirer en boutique")
        + ", pour le … (" + prix + " €)."
        + (mot ? " Mot sur la carte : « " + mot + " »." : "");
      sms.setAttribute("href", numero + "?&body=" + encodeURIComponent(message));
    }

    form.addEventListener("input", maj);
    form.addEventListener("change", maj);
    maj();
  }
  composer();

  var t = maintenantParis();
  if (t.jour < 0) return;
  majEtat(t);
  majLivraison(t);
  majSaison(t);
  majAujourdhui(t);
})();
