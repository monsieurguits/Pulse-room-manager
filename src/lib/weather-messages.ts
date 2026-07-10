const MIN_WEATHER_DEGREE = -10;
const MAX_WEATHER_DEGREE = 45;

const modelWeatherMessages: Record<number, string> = {
  [-10]: "Hello, {pseudo}, il fait {temp}°C dehors. Le froid est mordant, vos fans auront besoin d'une chaleur très spéciale aujourd'hui.",
  [-9]: "Hello, {pseudo}, il fait {temp}°C dehors. Une journée glaciale, parfaite pour faire grimper la température dans la room.",
  [-8]: "Hello, {pseudo}, il fait {temp}°C dehors. Vos fans risquent d'avoir froid, à vous de leur offrir un peu de fièvre.",
  [-7]: "Hello, {pseudo}, il fait {temp}°C dehors. L'air est gelé, mais l'ambiance peut vite devenir brûlante.",
  [-6]: "Hello, {pseudo}, il fait {temp}°C dehors. Un froid pareil mérite une session qui réchauffe vraiment.",
  [-5]: "Hello, {pseudo}, il fait {temp}°C dehors. Dehors ça pique, dedans vous pouvez faire fondre l'atmosphère.",
  [-4]: "Hello, {pseudo}, il fait {temp}°C dehors. Les fans vont chercher de la chaleur, autant leur donner une bonne raison de rester.",
  [-3]: "Hello, {pseudo}, il fait {temp}°C dehors. Une météo froide, idéale pour créer quelques frissons bien placés.",
  [-2]: "Hello, {pseudo}, il fait {temp}°C dehors. Le froid s'installe, mais votre room peut vite devenir plus accueillante.",
  [-1]: "Hello, {pseudo}, il fait {temp}°C dehors. Juste sous zéro, parfait pour commencer doucement et faire monter l'envie.",
  0: "Hello, {pseudo}, il fait {temp}°C dehors. Le thermomètre bloque, à vous de faire monter la température.",
  1: "Hello, {pseudo}, il fait {temp}°C dehors. Une ambiance fraîche qui ne demande qu'à être réchauffée.",
  2: "Hello, {pseudo}, il fait {temp}°C dehors. Vos fans auront sûrement envie d'un peu de chaleur.",
  3: "Hello, {pseudo}, il fait {temp}°C dehors. Le moment parfait pour transformer le froid en frissons.",
  4: "Hello, {pseudo}, il fait {temp}°C dehors. Une journée fraîche, idéale pour attirer les regards et faire durer l'envie.",
  5: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait froid, mais votre énergie peut vite changer l'ambiance.",
  6: "Hello, {pseudo}, il fait {temp}°C dehors. De quoi donner envie à vos fans de se rapprocher un peu.",
  7: "Hello, {pseudo}, il fait {temp}°C dehors. Une fraîcheur parfaite pour jouer avec la tension.",
  8: "Hello, {pseudo}, il fait {temp}°C dehors. L'air est frais, l'ambiance peut devenir délicieusement chaude.",
  9: "Hello, {pseudo}, il fait {temp}°C dehors. Vos fans auront besoin d'un petit supplément de chaleur.",
  10: "Hello, {pseudo}, il fait {temp}°C dehors. Frais dehors, mais tout peut vite s'intensifier ici.",
  11: "Hello, {pseudo}, il fait {temp}°C dehors. Une météo douce-froide, parfaite pour faire monter l'attention.",
  12: "Hello, {pseudo}, il fait {temp}°C dehors. Les frissons sont de saison, autant les rendre agréables.",
  13: "Hello, {pseudo}, il fait {temp}°C dehors. Une température idéale pour installer une tension subtile.",
  14: "Hello, {pseudo}, il fait {temp}°C dehors. L'ambiance est encore fraîche, mais vos fans peuvent vite la réchauffer.",
  15: "Hello, {pseudo}, il fait {temp}°C dehors. Juste ce qu'il faut de fraîcheur pour faire naître l'envie.",
  16: "Hello, {pseudo}, il fait {temp}°C dehors. La journée commence douce, parfaite pour jouer avec l'intensité.",
  17: "Hello, {pseudo}, il fait {temp}°C dehors. Une météo légère, idéale pour faire monter les pulsations.",
  18: "Hello, {pseudo}, il fait {temp}°C dehors. L'air est agréable, la room peut devenir beaucoup plus chaude.",
  19: "Hello, {pseudo}, il fait {temp}°C dehors. La température approche du parfait équilibre, à vous de la faire basculer.",
  20: "Hello, {pseudo}, il fait {temp}°C dehors. Doux dehors, prometteur dedans.",
  21: "Hello, {pseudo}, il fait {temp}°C dehors. La chaleur commence à se sentir, vos fans aussi.",
  22: "Hello, {pseudo}, il fait {temp}°C dehors. Une belle chaleur, parfaite pour faire monter le rythme.",
  23: "Hello, {pseudo}, il fait {temp}°C dehors. L'ambiance se réchauffe, et tout peut devenir plus intense.",
  24: "Hello, {pseudo}, il fait {temp}°C dehors. Une température idéale pour faire vibrer la room.",
  25: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait chaud, vos fans vont vouloir suivre le mouvement.",
  26: "Hello, {pseudo}, il fait {temp}°C dehors. La chaleur est là, parfaite pour jouer avec le désir.",
  27: "Hello, {pseudo}, il fait {temp}°C dehors. Journée chaude, ambiance prête à monter d'un cran.",
  28: "Hello, {pseudo}, il fait {temp}°C dehors. Il commence à faire très chaud, vos fans risquent d'adorer ça.",
  29: "Hello, {pseudo}, il fait {temp}°C dehors. La chaleur s'installe, l'intensité peut suivre.",
  30: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait brûlant, parfait pour faire perdre quelques degrés de contrôle.",
  31: "Hello, {pseudo}, il fait {temp}°C dehors. La journée est chaude, votre room peut devenir incandescente.",
  32: "Hello, {pseudo}, il fait {temp}°C dehors. La chaleur monte fort, vos fans vont vouloir jouer avec.",
  33: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait très chaud, l'ambiance peut devenir irrésistible.",
  34: "Hello, {pseudo}, il fait {temp}°C dehors. La température grimpe, parfaite pour une session intense.",
  35: "Hello, {pseudo}, il fait {temp}°C dehors. Chaleur lourde dehors, tension délicieuse dans la room.",
  36: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait torride, vos fans n'attendent qu'un signal.",
  37: "Hello, {pseudo}, il fait {temp}°C dehors. Une chaleur pareille mérite une ambiance brûlante.",
  38: "Hello, {pseudo}, il fait {temp}°C dehors. Le thermomètre s'emballe, parfait pour faire monter l'intensité.",
  39: "Hello, {pseudo}, il fait {temp}°C dehors. La journée est étouffante, votre room peut l'être encore plus.",
  40: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait extrêmement chaud, vos fans vont vouloir tester vos limites.",
  41: "Hello, {pseudo}, il fait {temp}°C dehors. La chaleur est presque indécente, l'ambiance peut l'être aussi.",
  42: "Hello, {pseudo}, il fait {temp}°C dehors. Le dehors brûle, la room peut devenir explosive.",
  43: "Hello, {pseudo}, il fait {temp}°C dehors. À cette température, chaque vibration peut devenir mémorable.",
  44: "Hello, {pseudo}, il fait {temp}°C dehors. Il fait infernal dehors, parfait pour une session sans tiédeur.",
  45: "Hello, {pseudo}, il fait {temp}°C dehors. Le thermomètre explose, à vous de faire exploser l'ambiance.",
};

const memberWeatherMessages: Record<number, string> = {
  [-10]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de la réchauffer avec beaucoup d'attention.",
  [-9]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Offrez-lui une chaleur qu'elle ne pourra pas ignorer.",
  [-8]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Quelques vibrations bien choisies devraient vite faire effet.",
  [-7]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. À vous de transformer le froid en frissons.",
  [-6]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Elle mérite une montée en température tout en douceur.",
  [-5]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de lui envoyer un peu de chaleur.",
  [-4]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-lui oublier le froid avec une intensité bien placée.",
  [-3]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Les frissons sont prêts, à vous de les guider.",
  [-2]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Commencez doucement, puis faites monter la chaleur.",
  [-1]: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Le froid est là, mais vous pouvez vite changer l'ambiance.",
  0: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de faire grimper le thermomètre.",
  1: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Une petite dose de chaleur serait parfaite.",
  2: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-lui sentir que la température peut monter.",
  3: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Quelques frissons pourraient devenir très agréables.",
  4: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. À vous de réchauffer l'ambiance.",
  5: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il fait froid, mais votre contrôle peut tout changer.",
  6: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Une montée douce serait idéale pour commencer.",
  7: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-lui découvrir une chaleur progressive.",
  8: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Les frissons sont permis, surtout les meilleurs.",
  9: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de la réchauffer délicatement.",
  10: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Une intensité douce pourrait lancer les choses.",
  11: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites monter l'ambiance sans vous presser.",
  12: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Quelques vibrations suffisent parfois à tout changer.",
  13: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de jouer avec ses frissons.",
  14: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Réchauffez-la juste comme il faut.",
  15: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Laissez monter la température doucement.",
  16: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Une belle occasion de faire naître l'envie.",
  17: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites battre le rythme un peu plus fort.",
  18: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de lui offrir quelques frissons.",
  19: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites monter la tension degré par degré.",
  20: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Le moment est parfait pour commencer à jouer.",
  21: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. L'ambiance se réchauffe, à vous de la faire mouiller.",
  22: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites monter la chaleur avec précision.",
  23: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Elle est prête pour une intensité plus joueuse.",
  24: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de la faire vibrer un peu plus fort.",
  25: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il fait chaud, parfait pour la faire mouiller.",
  26: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La chaleur est là, faites-la monter encore.",
  27: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Jouez avec l'intensité, elle devrait adorer.",
  28: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La journée est chaude, rendez-la encore plus intense.",
  29: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites grimper la chaleur sans retenue.",
  30: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il fait brûlant, à vous de la faire fondre.",
  31: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La chaleur appelle une intensité plus audacieuse.",
  32: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-lui sentir que la température peut encore monter.",
  33: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La room est prête pour quelque chose de très chaud.",
  34: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il est temps de la faire vibrer intensément.",
  35: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La chaleur est lourde, rendez-la délicieuse.",
  36: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites monter l'intensité jusqu'à la rendre irrésistible.",
  37: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Une température pareille mérite un contrôle brûlant.",
  38: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-la mouiller sous la chaleur.",
  39: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Chaque vibration peut devenir plus intense.",
  40: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Il fait extrêmement chaud, poussez l'ambiance plus loin.",
  41: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites-lui perdre un peu le contrôle.",
  42: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. La chaleur est folle, rendez-la inoubliable.",
  43: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. À vous de transformer cette chaleur en plaisir.",
  44: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Faites monter l'intensité jusqu'au point de rupture.",
  45: "Hello, {pseudo}, il fait actuellement {temp}°C chez {modele}. Le thermomètre explose, à vous de la faire exploser aussi.",
};

export function getModelWeatherMessage(input: { pseudo: string; temperature: number }): string {
  const degree = normalizeWeatherDegree(input.temperature);
  const template = modelWeatherMessages[degree] ?? modelWeatherMessages[MAX_WEATHER_DEGREE]!;

  return fillWeatherMessage(template, {
    pseudo: input.pseudo,
    temp: String(degree),
  });
}

export function getMemberWeatherMessage(input: { pseudo: string; modelName: string; temperature: number }): string {
  const degree = normalizeWeatherDegree(input.temperature);
  const template = memberWeatherMessages[degree] ?? memberWeatherMessages[MAX_WEATHER_DEGREE]!;

  return fillWeatherMessage(template, {
    pseudo: input.pseudo,
    modele: input.modelName,
    temp: String(degree),
  });
}

function normalizeWeatherDegree(temperature: number): number {
  return Math.min(MAX_WEATHER_DEGREE, Math.max(MIN_WEATHER_DEGREE, Math.round(temperature)));
}

function fillWeatherMessage(template: string, values: Record<string, string>): string {
  return template.replaceAll(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}
