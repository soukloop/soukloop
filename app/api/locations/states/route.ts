import { NextResponse } from 'next/server';
import { State } from 'country-state-city';

export async function GET() {
    try {
        const usStates = State.getStatesOfCountry('US');
        // Map to format expected by frontend: { id: isoCode, name: name }
        const formattedStates = usStates.map(state => ({
            id: state.isoCode,
            name: state.name
        }));

        return NextResponse.json(formattedStates);
    } catch (error) {
        console.error('Failed to fetch states:', error);
        return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
    }
}
