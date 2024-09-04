import PagesManagerContextProvider from "../../store/products/PagesManagerContext";
import TabsComponent, { ITagsObjDefault } from "../structure/TabsComponent";
import Header from "../UI/headers/Header";
import ManageOrders from "./admin/ManageOrders";
import ManageProducts from "./admin/ManageProducts";
import ManageUsers from "./admin/users/ManageUsers";

type adminPanelPossibleSectionsNames =
  | "manageOrders"
  | "manageUsers"
  | "manageProducts";

const adminPanelPossibleSections: ITagsObjDefault<adminPanelPossibleSectionsNames>[] =
  [
    {
      ComponentToRender: <ManageOrders />,
      header: "Manage orders",
      tagName: "manageOrders",
    },
    {
      ComponentToRender: (
        <PagesManagerContextProvider>
          <ManageUsers />
        </PagesManagerContextProvider>
      ),
      header: "Manage users",
      tagName: "manageUsers",
    },
    {
      ComponentToRender: <ManageProducts />,
      header: "Manage products",
      tagName: "manageProducts",
    },
  ];

export default function UserAdminPanel() {
  return (
    <>
      <Header additionalTailwindClasses="pb-8" usePaddingBottom={false}>
        Here you can manage various data in your shop
      </Header>
      <TabsComponent
        defaultTabsStateValue={
          "manageOrders" as adminPanelPossibleSectionsNames
        }
        generateAvailableTabsFromAllFnStable={(tags) => tags}
        possibleTabsStable={adminPanelPossibleSections}
      />
    </>
  );
}
