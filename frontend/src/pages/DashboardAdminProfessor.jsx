import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function DashboardAdminProfessor() {
  const { role, user } = useSelector((state) => state.auth); // Obter dados do Redux
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate("/auth/login"); // Caso o usuário não tenha papel, redireciona para login
    }
  }, [role, navigate]);

  const navigation = [
    { name: "Home", href: "#", current: true },
    { name: "Gerenciar Faltas", href: "/absences/professor/", current: false },
    { name: "Solicitações de Perdão", href: "/professor/requests/", current: false },
    ...(role === "admin" ? [
      { name: "Cadastrar Novo Usuário", href: "/auth/register", current: false }
    ] : []), 
  ];

  const userNavigation = [
    { name: "Logout", href: "/logout" },
  ];

  if (!user) {
    return <p className="text-center text-gray-500">Carregando...</p>;
  }

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  alt="Logo"
                  src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                  className="size-8"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img alt={user.username} src={user.imageUrl || "default-image-url.jpg"} className="size-8 rounded-full" />
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <a
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.name}
                        </a>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
          </div>
        </div>
      </Disclosure>

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seja bem-vindo, {user.username}!</h1>
        </div>
      </header>

      <main>
      </main>
    </div>
  );
}

export default DashboardAdminProfessor;
