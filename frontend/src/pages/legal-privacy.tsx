import { LegalLayout } from '@/components/Legal/LegalLayout';

export default function LegalPrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="août 2026">
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Chérine Klingele, entreprise individuelle, domiciliée à Genève, Suisse, est responsable du traitement des
          données personnelles collectées via EduNutrition au sens de la loi fédérale sur la protection des
          données (LPD). Contact : cherineklingele@hotmail.com.
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <ul>
          <li>
            <strong>Données d’identité</strong> : prénom, nom, adresse email, rôle (élève, enseignant·e,
            infirmier·ère, administrateur·rice), établissement scolaire ;
          </li>
          <li>
            <strong>Données de progression pédagogique</strong> : modules et leçons suivis, réponses et scores aux
            quiz, dates de complétion ;
          </li>
          <li>
            <strong>Données techniques minimales</strong> : jeton de session nécessaire à la connexion. Le Service
            n’utilise pas de cookies publicitaires ni de traceurs tiers.
          </li>
        </ul>
        <p>
          EduNutrition ne collecte aucune donnée de santé individuelle (poids, données médicales, journal
          alimentaire personnel) : le contenu porte sur l’éducation nutritionnelle générale, pas sur le suivi
          médical d’un·e élève en particulier.
        </p>
      </section>

      <section>
        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>Fournir l’accès aux modules pédagogiques et suivre la progression de chaque élève ;</li>
          <li>Permettre aux enseignant·e·s et infirmier·ère·s scolaires de suivre la progression de leur classe ;</li>
          <li>Produire des statistiques agrégées et anonymisées à destination des écoles ;</li>
          <li>Assurer la sécurité et le bon fonctionnement du Service.</li>
        </ul>
      </section>

      <section>
        <h2>4. Base légale et cas particulier des élèves mineur·e·s</h2>
        <p>
          Le traitement repose sur l’exécution du contrat conclu entre l’Éditrice et l’établissement scolaire, et
          sur l’intérêt légitime à assurer le suivi pédagogique. <strong>Pour les élèves mineur·e·s, c’est
          l’établissement scolaire qui est responsable de s’assurer que l’inscription au Service respecte les
          règles applicables en matière d’information des parents et, le cas échéant, de recueil de leur
          consentement</strong>, conformément à ses propres obligations et à la réglementation cantonale en
          matière scolaire. L’Éditrice agit comme sous-traitant technique pour le compte de l’école sur ce point.
        </p>
      </section>

      <section>
        <h2>5. Destinataires et sous-traitants</h2>
        <p>Les données sont hébergées et traitées par les prestataires suivants, dans le cadre strict du Service :</p>
        <ul>
          <li>
            <strong>Supabase</strong> (base de données et authentification) — infrastructure hébergée en Europe ;
          </li>
          <li>
            <strong>Vercel</strong> (hébergement de l’interface) et <strong>Railway</strong> (hébergement du
            serveur applicatif) — la localisation précise des serveurs de ces deux prestataires n’est pas garantie
            être exclusivement suisse ou européenne à ce stade ; ce point doit être vérifié et, le cas échéant,
            encadré contractuellement (clauses de transfert) avant un déploiement à grande échelle.
          </li>
        </ul>
        <p>Aucune donnée n’est vendue ni partagée à des fins publicitaires.</p>
      </section>

      <section>
        <h2>6. Durée de conservation</h2>
        <p>
          Les données d’un compte sont conservées tant que l’école reste cliente et que le compte est actif.
          Après désinscription d’un·e élève ou fin de contrat d’une école, les données sont supprimées ou
          anonymisées dans un délai raisonnable, sous réserve d’obligations légales de conservation.
        </p>
      </section>

      <section>
        <h2>7. Vos droits</h2>
        <p>
          Conformément à la LPD, toute personne concernée peut demander l’accès à ses données, leur rectification,
          leur suppression, ou s’opposer à leur traitement, en écrivant à cherineklingele@hotmail.com. Pour un·e
          élève mineur·e, cette demande peut être formulée par l’établissement scolaire ou les titulaires de
          l’autorité parentale. Vous disposez également d’un droit de réclamation auprès du Préposé fédéral à la
          protection des données et à la transparence (PFPDT).
        </p>
      </section>

      <section>
        <h2>8. Sécurité</h2>
        <p>
          Les données transitent exclusivement via des connexions chiffrées (HTTPS). L’accès aux données est
          restreint par rôle (un·e élève ne voit que ses propres données ; un·e enseignant·e ne voit que les
          données de son établissement) grâce à des règles de sécurité appliquées au niveau de la base de données.
        </p>
      </section>

      <section>
        <h2>9. Modification de la politique</h2>
        <p>
          La présente politique peut être mise à jour ; toute modification substantielle sera communiquée aux
          écoles clientes par email.
        </p>
      </section>
    </LegalLayout>
  );
}
