# FitConnect

FitConnect relie les membres, les coachs et les salles de sport. Le public peut comparer les salles et leurs abonnements, consulter les profils des coachs et découvrir leurs créneaux. Les membres réservent des séances, achètent ou renouvellent des abonnements et retrouvent leurs achats dans leur espace.

## Fonctionnalités

| Espace | Fonctionnalités |
| --- | --- |
| **Visiteur** | Catalogue des salles, des coachs et des packs, recherche et filtres, calcul de l’indice de masse corporelle (IMC) et formulaire de contact. |
| **Membre** | Inscription avec confirmation par e-mail, connexion par mot de passe ou via Google, réinitialisation du mot de passe, réservation de séances, achat et renouvellement d’abonnements, historique et accès aux salles vidéo des séances réservées. |
| **Coach** | Calendrier de disponibilités, publication de créneaux, prochaines séances, liste des clients et accès aux salles vidéo. |
| **Salle de sport** | Création et modification de packs, gestion des profils de l’équipe, suivi des membres et du statut de leurs abonnements, revenus par mois, par année et par pack. |
| **Administration** | Tableau de bord agrégé, listes avec recherche et filtres, activation des comptes professionnels, gestion des catégories et des messages de contact. Le super administrateur peut gérer les comptes administrateurs. |

## Architecture

| Répertoire | Contenu | Adresse locale |
| --- | --- | --- |
| [`frontend/`](frontend/) | Application Angular 16 et TypeScript pour le public, les membres, les coachs et les salles | `http://localhost:4200` |
| [`admin/`](admin/) | Application Angular 16 et TypeScript dédiée à l’administration | `http://localhost:4201` |
| [`backend/`](backend/) | API REST Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA et MySQL | `http://localhost:8081/api` |

Les deux applications appellent l’API sur le chemin relatif `/api`. En développement, le [proxy Angular partagé](proxy.conf.json) transmet ces requêtes à Spring Boot. Le serveur signe les sessions JWT et vérifie le rôle et la propriété des données. Les mots de passe sont hachés avec BCrypt. Stripe héberge la page de paiement, ZEGOCLOUD fournit les salles vidéo et le serveur SMTP distribue les e-mails de compte.

## Démarrer en local

### 1. Installer les prérequis

Installez Java 21, MySQL et la version de Node.js indiquée dans [`.nvmrc`](.nvmrc), actuellement **18.20.8**, pour la compatibilité avec Angular 16. Le dépôt fournit le wrapper Maven. Sur macOS ou Linux avec nvm, exécutez `nvm install` puis `nvm use` depuis la racine. Avec nvm-windows, utilisez `nvm install 18.20.8` puis `nvm use 18.20.8`.

Démarrez MySQL sur le port `3306`, puis exécutez ces commandes avec un compte administrateur MySQL. Remplacez le mot de passe d’exemple par celui de votre environnement local.

```sql
CREATE DATABASE IF NOT EXISTS fitconnect CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'fitconnect'@'localhost' IDENTIFIED BY 'votre-mot-de-passe-local';
GRANT ALL PRIVILEGES ON fitconnect.* TO 'fitconnect'@'localhost';
```

Pour tester les confirmations de compte, les réinitialisations et les notifications d’activation, démarrez un serveur SMTP local de capture sur le port `1025`.

### 2. Lancer l’API

Depuis le répertoire `backend`, définissez le profil local et le mot de passe MySQL. Hibernate crée ou met à jour les tables du profil `local`.

**PowerShell**

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:SPRING_DATASOURCE_PASSWORD = 'votre-mot-de-passe-local'
.\mvnw.cmd spring-boot:run
```

**macOS ou Linux**

```bash
export SPRING_PROFILES_ACTIVE=local
export SPRING_DATASOURCE_PASSWORD='votre-mot-de-passe-local'
bash ./mvnw spring-boot:run
```

Sur une base vide, renseignez aussi `FITCONNECT_FIRST_ADMIN_EMAIL` et `FITCONNECT_FIRST_ADMIN_PASSWORD` avant le démarrage pour créer le premier super administrateur. Choisissez un mot de passe d’au moins 12 caractères. Vous pourrez ensuite retirer ces deux variables.

### 3. Lancer les interfaces

Dans un terminal ouvert dans `frontend` et un autre ouvert dans `admin`, exécutez les commandes suivantes.

```bash
npm ci
npm start
```

Ouvrez [l’application FitConnect](http://localhost:4200) et [l’espace d’administration](http://localhost:4201). Pour essayer un parcours complet, créez un compte membre et confirmez-le via l’e-mail reçu. Inscrivez un coach et une salle, puis activez leurs comptes dans l’administration. Le coach peut ensuite publier un créneau dans **Disponibilités** et la salle publier un pack dans **Mes packs**.

## Configuration de l’API

| Variable d’environnement | Valeur par défaut ou usage |
| --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/fitconnect` |
| `SPRING_DATASOURCE_USERNAME` | `fitconnect` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe MySQL |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT` | `localhost` et `1025` |
| `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | Identifiants de votre serveur SMTP, si requis |
| `FITCONNECT_API_BASE_URL` | URL publique de l’API avec le préfixe `/api`, utilisée dans les e-mails de confirmation |
| `FITCONNECT_FRONTEND_BASE_URL` | URL de l’application membre, utilisée dans les liens de réinitialisation et de retour Stripe |
| `FITCONNECT_JWT_SECRET` | Clé de signature Base64 représentant au moins 32 octets aléatoires. Les profils `local` et `test` génèrent une clé temporaire si elle est absente. |
| `FITCONNECT_FIRST_ADMIN_EMAIL`, `FITCONNECT_FIRST_ADMIN_PASSWORD` | Initialisation du premier super administrateur quand la table est vide |
| `FITCONNECT_GOOGLE_CLIENT_ID` | Identifiant OAuth Google attendu par l’API. Utilisez le même identifiant dans la configuration Angular du bouton Google. |
| `FITCONNECT_STRIPE_SECRET_KEY`, `FITCONNECT_STRIPE_WEBHOOK_SECRET` | Clé secrète Stripe et secret de signature du webhook |
| `FITCONNECT_CHECKOUT_CURRENCY` | Devise Stripe à deux décimales activée sur le compte marchand, par exemple `eur` |
| `FITCONNECT_ZEGO_APP_ID`, `FITCONNECT_ZEGO_SERVER_SECRET` | Projet ZEGOCLOUD et secret de signature des jetons vidéo. Activez les contrôles d’accès aux salles et aux flux sur le projet. |

La configuration par défaut est dans [`application.yaml`](backend/src/main/resources/application.yaml). Conservez les valeurs secrètes dans votre environnement d’exécution.

## Paiements et accès vidéo

Le serveur calcule le montant à partir du catalogue. Il vérifie la confirmation auprès de Stripe et enregistre une réservation ou une période d’abonnement une seule fois, même si Stripe renvoie le même événement. La réservation d’une séance doit commencer au moins **31 minutes** avant son début. La session de paiement expire au plus tard au début de la séance, dans la limite de **45 minutes**. Une période d’abonnement dure **30 jours**. Un renouvellement débute à la fin de la dernière période, ou à la date de confirmation du paiement si cette période est déjà expirée.

Pour tester Checkout en local, lancez Stripe CLI en mode test et transférez les événements vers l’API.

```bash
stripe listen --events checkout.session.completed,checkout.session.expired --forward-to localhost:8081/api/checkout/stripe/webhook
```

Configurez la clé Stripe de test, le secret de signature affiché par la CLI et la devise, puis redémarrez l’API. Réservez une séance ou choisissez un pack depuis l’application membre et payez avec une carte de test Stripe. Vérifiez ensuite le résultat dans **Mes réservations** ou **Mes abonnements**.

L’accès vidéo utilise des jetons serveur de cinq minutes. Seuls le coach de la séance et les membres ayant une réservation correspondante peuvent obtenir un jeton pour sa salle.

## Builds et tests

Dans `frontend` et `admin`, exécutez les commandes suivantes. Si Chromium n’est pas détecté, définissez `CHROME_BIN` avec le chemin vers Chrome, Chromium ou Edge.

```bash
npm ci
npm run build
npm test -- --configuration=ci --watch=false --browsers=ChromeHeadless
```

Les builds sont générés dans `frontend/dist/frontend` et `admin/dist/admin`. Le profil `ci` exécute les suites ciblées. Les suites Angular complètes présentent encore des erreurs d’import dans les tests historiques du service d’authentification côté client et du service de notification côté admin.

Dans `backend`, lancez `.\mvnw.cmd -B -ntp verify` sous PowerShell ou `bash ./mvnw -B -ntp verify` sous macOS et Linux. Les tests utilisent H2 en mode de compatibilité MySQL et simulent les services de paiement. [GitHub Actions](.github/workflows/ci.yml) exécute les builds et ces suites à chaque push et pull request.

## Déploiement

- Déployez l’API et les deux applications Angular ensemble. Pour chaque interface, configurez un retour vers `index.html` pour les routes Angular et transmettez `/api` vers Spring Boot en conservant le préfixe.
- Utilisez un schéma MySQL initialisé. Sur un déploiement existant, appliquez [la migration Checkout](backend/database/checkout-purchase.sql) avant de démarrer l’API. La migration conserve les réservations et abonnements existants. La vérification Stripe s’applique aux nouveaux paiements.
- Configurez les URL publiques sans barre oblique finale. Utilisez la même clé JWT pour toutes les instances et le fuseau horaire utilisé par les plannings. Les utilisateurs existants devront se reconnecter après le remplacement du système de session.
- Vérifiez que les prix du catalogue sont exprimés dans la devise Stripe configurée. L’API utilise les montants du catalogue dans cette devise. Ajoutez le webhook public `/api/checkout/stripe/webhook` pour les événements `checkout.session.completed` et `checkout.session.expired`.
- Si vous reprenez un déploiement utilisant les anciens identifiants vidéo, révoquez et remplacez le secret ZEGOCLOUD avant d’activer les appels.
