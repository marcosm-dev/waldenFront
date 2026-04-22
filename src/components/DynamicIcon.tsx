import { icons, type LucideProps } from 'lucide-react';

interface Props extends Omit<LucideProps, 'name'> {
	name: string | null | undefined;
}

function toPascalCase(str: string): string {
	return str
		.split(/[-_\s]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}

const DEFAULT_ICON = 'mountain';

export default function DynamicIcon({ name, ...props }: Props) {
	const resolvedName = name || DEFAULT_ICON;
	const pascalName = toPascalCase(resolvedName) as keyof typeof icons;
	const Icon = icons[pascalName] || icons[toPascalCase(DEFAULT_ICON) as keyof typeof icons];

	if (!Icon) return null;

	return <Icon {...props} />;
}
