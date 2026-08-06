import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/Auth/LoginForm';
import { PlateLogo } from '@/components/Illustrations/PlateMark';
import { ProduceScatter } from '@/components/Illustrations/Produce';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div data-role="student" className="flex min-h-screen flex-col bg-background md:flex-row">
      <div className="relative flex flex-col justify-between overflow-hidden bg-primary px-8 py-10 text-primary-foreground md:w-[46%] md:px-14 md:py-14">
        <ProduceScatter />

        <div className="relative flex items-center gap-2.5">
          <PlateLogo className="h-9 w-9" />
          <span className="font-display text-lg font-semibold">EduNutrition</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-sm"
        >
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
            L’éducation nutritionnelle, version fraîche.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
            Des cours de nutrition pour le CO, le gymnase et l’université, imaginés avec des
            enseignant·e·s et des infirmier·ère·s scolaires de Suisse romande.
          </p>
        </motion.div>

        <p className="relative mt-10 text-xs text-primary-foreground/60 md:mt-0">
          On fait de la pédagogie ici, pas de la consultation médicale.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <h2 className="font-display text-xl font-semibold text-foreground">Se connecter</h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Retrouve tes modules et ta progression.
          </p>
          <LoginForm onSuccess={() => navigate('/')} />

          <p className="mt-6 text-xs text-muted-foreground">
            En te connectant, tu acceptes les{' '}
            <Link to="/cgu" className="underline hover:text-foreground">
              conditions d’utilisation
            </Link>{' '}
            et la{' '}
            <Link to="/confidentialite" className="underline hover:text-foreground">
              politique de confidentialité
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
