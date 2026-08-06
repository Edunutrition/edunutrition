import { LegalLayout } from '@/components/Legal/LegalLayout';

export default function LegalTermsPage() {
  return (
    <LegalLayout title="Conditions générales d’utilisation" updatedAt="août 2026">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions générales d’utilisation (« CGU ») régissent l’accès et l’utilisation de la
          plateforme EduNutrition (le « Service »), un outil d’éducation nutritionnelle destiné aux écoles de
          Suisse romande (cycles d’orientation, gymnases, hautes écoles) et à leurs élèves, enseignant·e·s et
          infirmier·ère·s scolaires.
        </p>
        <p>
          <strong>EduNutrition est un outil pédagogique. Il ne constitue en aucun cas une consultation, un
          diagnostic ou un avis médical</strong>, et ne remplace pas le suivi d’un·e professionnel·le de la santé.
        </p>
      </section>

      <section>
        <h2>2. Éditeur du Service</h2>
        <p>
          Le Service est édité par Chérine Klingele, entreprise individuelle, domiciliée à Genève, Suisse
          (« l’Éditrice »). Pour toute question relative aux présentes CGU : cherineklingele@hotmail.com.
        </p>
      </section>

      <section>
        <h2>3. Accès au Service</h2>
        <p>
          L’accès au Service se fait exclusivement sur invitation : une école souscrit un accès, puis invite ses
          enseignant·e·s, infirmier·ère·s scolaires et élèves par email. Chaque utilisateur·rice est responsable de
          la confidentialité de ses identifiants de connexion.
        </p>
        <p>
          Les comptes élèves sont créés à l’initiative de l’établissement scolaire, qui est responsable du respect
          des règles applicables au consentement des personnes mineures (voir la{' '}
          <a href="/confidentialite" className="underline">
            Politique de confidentialité
          </a>
          ).
        </p>
      </section>

      <section>
        <h2>4. Rôles et responsabilités des utilisateur·rice·s</h2>
        <ul>
          <li>Utiliser le Service conformément à sa destination pédagogique ;</li>
          <li>Ne pas usurper l’identité d’un tiers ni partager ses identifiants ;</li>
          <li>Ne pas extraire, copier ou diffuser le contenu pédagogique sans autorisation ;</li>
          <li>Signaler tout contenu ou comportement inapproprié à l’Éditrice.</li>
        </ul>
      </section>

      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          L’ensemble des éléments du Service (interface, textes, illustrations, structure des modules) est protégé
          par le droit d’auteur. Le contenu pédagogique créé par les enseignant·e·s au sein de leur école leur
          appartient ; ils·elles accordent à l’Éditrice le droit de l’héberger et de l’afficher aux élèves de leur
          établissement dans le cadre du Service.
        </p>
      </section>

      <section>
        <h2>6. Abonnements et tarification</h2>
        <p>
          L’accès au Service par une école peut être soumis à un abonnement payant. Les tarifs, paliers et
          modalités de facturation applicables sont communiqués séparément lors de la souscription et ne font pas
          partie des présentes CGU génériques.
        </p>
      </section>

      <section>
        <h2>7. Limitation de responsabilité</h2>
        <p>
          Le Service est fourni « en l’état ». L’Éditrice s’efforce d’assurer la disponibilité et l’exactitude du
          contenu pédagogique, sans garantir l’absence totale d’erreur ou d’interruption. L’Éditrice ne saurait
          être tenue responsable d’une utilisation du Service à des fins de diagnostic ou de traitement médical,
          usage pour lequel il n’est pas conçu.
        </p>
      </section>

      <section>
        <h2>8. Résiliation</h2>
        <p>
          Une école peut mettre fin à son abonnement selon les modalités convenues lors de la souscription.
          L’Éditrice peut suspendre un compte en cas de violation manifeste des présentes CGU.
        </p>
      </section>

      <section>
        <h2>9. Droit applicable et for</h2>
        <p>
          Les présentes CGU sont soumises au droit suisse. Tout litige relève de la compétence exclusive des
          tribunaux du canton de Genève, sous réserve de dispositions légales impératives contraires.
        </p>
      </section>

      <section>
        <h2>10. Modification des CGU</h2>
        <p>
          L’Éditrice peut modifier les présentes CGU à tout moment. Les écoles seront informées de toute
          modification substantielle par email.
        </p>
      </section>
    </LegalLayout>
  );
}
