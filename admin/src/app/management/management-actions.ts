import { Observable } from 'rxjs';
import { TableAction } from './management-table.component';

export function deleteAction(label: string, remove: () => Observable<unknown>): TableAction {
  return {
    label: 'Supprimer',
    confirmation: `Supprimer « ${label} » ? Cette action est définitive.`,
    success: 'Suppression effectuée.',
    destructive: true,
    run: remove,
  };
}

export function activationAction(label: string, active: boolean, update: (active: boolean) => Observable<unknown>): TableAction {
  const verb = active ? 'Désactiver' : 'Activer';
  return {
    label: verb,
    confirmation: `${verb} le compte « ${label} » ?`,
    success: active ? 'Compte désactivé.' : 'Compte activé.',
    run: () => update(!active),
  };
}
