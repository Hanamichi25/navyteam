/** Objeto de navegación capaz de despachar un action de navegación. */
interface Dispatchable {
  dispatch: (action: {
    type: string;
    payload?: object;
    source?: string;
    target?: string;
  }) => void;
}

/**
 * Abre el menú lateral (Drawer).
 *
 * Equivale a `navigation.dispatch(DrawerActions.openDrawer())`, pero sin importar
 * `@react-navigation/native` — Expo SDK 56+ prohíbe ese import en apps con
 * expo-router. El action `{ type: 'OPEN_DRAWER' }` es exactamente lo que devuelve
 * `DrawerActions.openDrawer()` y burbujea hasta el navegador Drawer padre.
 */
export function openDrawer(navigation: Dispatchable): void {
  navigation.dispatch({ type: 'OPEN_DRAWER' });
}
