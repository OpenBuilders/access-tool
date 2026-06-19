import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: Omit<FeatureItem, 'Svg'>[] = [
  {
    title: 'Easy to Use',
    description: (
      <>
        Access Tool provides a simple interface to manage Telegram chat access
        and participant rules with minimal setup.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    description: (
      <>
        Define your rules, and let Access Tool handle the enforcement and
        indexing for you automatically.
      </>
    ),
  },
  {
    title: 'Powerful Integration',
    description: (
      <>
        With its robust API and background workers, Access Tool integrates
        seamlessly with your existing Telegram workflows.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
