import React from 'react';
import View from './view';
import { useNavigate } from 'react-router-dom';
import NotFound from './notFound';
import Button from '../components/button';
import { pizzaService } from '../service/service';
import { Franchise, FranchiseList, Role, Store, User, UserList } from '../service/pizzaService';
import { CloseIcon, TrashIcon } from '../icons';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return String(error);
}

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({ franchises: [], more: false });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const [userList, setUserList] = React.useState<UserList>({ users: [], more: false });
  const [userPage, setUserPage] = React.useState(1);
  const [userNameFilter, setUserNameFilter] = React.useState('*');
  const [userRefreshKey, setUserRefreshKey] = React.useState(0);
  const [userError, setUserError] = React.useState<string | null>(null);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);
  const filterUserRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      setFranchiseList(await pizzaService.getFranchises(franchisePage, 3, '*'));
    })();
  }, [props.user, franchisePage]);

  React.useEffect(() => {
    let cancelled = false;
    setUsersLoading(true);
    (async () => {
      try {
        const users = await pizzaService.getUsers(userPage, 10, userNameFilter);
        if (!cancelled) {
          setUserList(users);
          setUserError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setUserError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.user, userPage, userNameFilter, userRefreshKey]);

  function createFranchise() {
    navigate('/admin-dashboard/create-franchise');
  }

  function getHighestUserRole(user: User): string {
    const roles = user.roles?.map(({ role }) => role) ?? [];
    if (roles.includes(Role.Admin)) return Role.Admin;
    if (roles.includes(Role.Franchisee)) return Role.Franchisee;
    if (roles.includes(Role.Diner)) return Role.Diner;
    return '-';
  }

  function searchUsers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = filterUserRef.current?.value.trim() ?? '';
    setUserError(null);
    setUserPage(1);
    setUserNameFilter(name ? `*${name}*` : '*');
    setUserRefreshKey((key) => key + 1);
  }

  async function deleteUser(user: User) {
    if (!user.id || !window.confirm(`Delete ${user.name || user.email || 'this user'}?`)) {
      return;
    }

    setDeletingUserId(user.id);
    setUserError(null);
    try {
      await pizzaService.deleteUser(user.id);
      if (userList.users.length === 1 && userPage > 1) {
        setUserPage(userPage - 1);
      } else {
        setUsersLoading(true);
        try {
          const refreshedUsers = await pizzaService.getUsers(userPage, 10, userNameFilter);
          setUserList(refreshedUsers);
        } catch (error) {
          setUserError(getErrorMessage(error));
        } finally {
          setUsersLoading(false);
        }
      }
    } catch (error) {
      setUserError(getErrorMessage(error));
    } finally {
      setDeletingUserId(null);
    }
  }

  async function closeFranchise(franchise: Franchise) {
    navigate('/admin-dashboard/close-franchise', { state: { franchise: franchise } });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate('/admin-dashboard/close-store', { state: { franchise: franchise, store: store } });
  }

  async function filterFranchises() {
    setFranchiseList(await pizzaService.getFranchises(franchisePage, 10, `*${filterFranchiseRef.current?.value}*`));
  }

  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-neutral-100 text-xl">Users</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                  <tr>
                    {['Name', 'Email', 'Role', ''].map((header, index) => (
                      <th key={`${header}-${index}`} scope="col" className="px-4 py-3 text-center text-xs font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!usersLoading && userList.users.map((user, index) => (
                    <tr key={user.id ?? user.email ?? index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{user.name || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{user.email || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{getHighestUserRole(user)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-end">
                        <button
                          type="button"
                          aria-label={`Delete ${user.name || user.email || 'user'}`}
                          className="inline-flex items-center text-gray-600 hover:text-red-600 disabled:opacity-50"
                          onClick={() => deleteUser(user)}
                          disabled={!user.id || deletingUserId === user.id}>
                          <CloseIcon className="" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(usersLoading || userList.users.length === 0) && !userError && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-600">
                        {usersLoading ? 'Loading users...' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 p-2">
              <form className="flex items-center gap-2" onSubmit={searchUsers}>
                <input
                  type="text"
                  ref={filterUserRef}
                  name="filterUser"
                  placeholder="Name"
                  aria-label="Filter users by name"
                  className="w-36 px-2 py-1 text-sm border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800">
                  Search
                </button>
              </form>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:bg-neutral-300"
                  onClick={() => setUserPage(userPage - 1)}
                  disabled={userPage <= 1 || usersLoading}>
                  Prev
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:bg-neutral-300"
                  onClick={() => setUserPage(userPage + 1)}
                  disabled={!userList.more || usersLoading}>
                  Next
                </button>
              </div>
            </div>
          </div>
          {userError && <p role="alert" className="text-red-200">{userError}</p>}

          <h3 className="text-neutral-100 text-xl">Franchises</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {['Franchise', 'Franchisee', 'Store', 'Revenue', 'Action'].map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {franchiseList.franchises.map((franchise, findex) => {
                        return (
                          <tbody key={findex} className="divide-y divide-gray-200">
                            <tr className="border-neutral-500 border-t-2">
                              <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">{franchise.name}</td>
                              <td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800" colSpan={3}>
                                {franchise.admins?.map((o) => o.name).join(', ')}
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800" onClick={() => closeFranchise(franchise)}>
                                  <TrashIcon />
                                  Close
                                </button>
                              </td>
                            </tr>

                            {franchise.stores.map((store, sindex) => {
                              return (
                                <tr key={sindex} className="bg-neutral-100">
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800" colSpan={3}>
                                    {store.name}
                                  </td>
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">{store.totalRevenue?.toLocaleString()} ₿</td>
                                  <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                    <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={() => closeStore(franchise, store)}>
                                      <TrashIcon />
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        );
                      })}
                      <tfoot>
                        <tr>
                          <td className="px-1 py-1">
                            <input type="text" ref={filterFranchiseRef} name="filterFranchise" placeholder="Filter franchises" className="px-2 py-1 text-sm border border-gray-300 rounded-lg" />
                            <button type="submit" className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={filterFranchises}>
                              Submit
                            </button>
                          </td>
                          <td colSpan={4} className="text-end text-sm font-medium">
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 " onClick={() => setFranchisePage(franchisePage - 1)} disabled={franchisePage <= 0}>
                              «
                            </button>
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300" onClick={() => setFranchisePage(franchisePage + 1)} disabled={!franchiseList.more}>
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button className="w-36 text-xs sm:text-sm sm:w-64" title="Add Franchise" onPress={createFranchise} />
        </div>
      </View>
    );
  }

  return response;
}
