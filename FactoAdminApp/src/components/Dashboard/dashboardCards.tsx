import { FaMoneyCheck } from "react-icons/fa";
import { LuFileCheck2, LuUsersRound } from "react-icons/lu";
import { RiTodoLine, RiStackLine } from "react-icons/ri";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { useEffect, useState } from "react";
import { USERS } from "@/api/user";
import { SERVICES } from "@/api/services";
import { QUERIES } from "@/api/query";
import { REQCALL } from "@/api/reqcall";

interface UserType {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  aadharNumber: string;
  panNumber: string;
  dateOfBirth: string;
}

interface ServiceType {
  _id: string;
  title: string;
  description: string;
  icon: File | string;
  isActive: boolean;
}

interface QueryType {
  _id: string;
  email: string;
  name: string;
  phoneNo: number;
  query: string;
  createdAt?: string;
  comment?: string;
}
interface ReqCallsType {
  _id: string;
  phoneNo: number;
}

const DashboardCards = () => {
  //user's info
  const [usersData, setUsersData] = useState<UserType[]>([]);
  const fetchData = async () => {
    try {
      const response = await USERS.GetUsers();
      setUsersData(response.data.users);
      console.log("front", response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  //service info
  const [servicesData, setServicesData] = useState<ServiceType[]>([]);
  const [activeServicesData, setActiveServicesData] = useState<ServiceType[]>(
    []
  );

  const fetchServiceData = async () => {
    try {
      const response = await SERVICES.GetServices();
      const allServices = response.data.services;
      setServicesData(allServices);
      const activeServices = allServices.filter(
        (service: ServiceType) => service.isActive
      );
      setActiveServicesData(activeServices);
    } catch (error) {
      console.error(error);
    }
  };

  //query
  const [queries, setQueries] = useState<QueryType[]>([]);

  const fetchQueriesData = async () => {
    try {
      const response = await QUERIES.Get();
      console.log(response.data.queries);
      setQueries(response.data.queries);
    } catch (error) {
      console.error(error);
    }
  };

  //call data
  const [callData, setCallData] = useState<ReqCallsType[]>([]);

  const fetchcallData = async () => {
    try {
      const response = await REQCALL.Get();
      console.log(response.data.requests);
      setCallData(response.data.requests);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchServiceData();
    fetchQueriesData();
    fetchcallData();
  }, []);

  const data = [
    {
      icon: <LuUsersRound />,
      title: "Total Users",
      value: usersData.length ? usersData.length : 0,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-orange-500",
    },
    {
      icon: <LuFileCheck2 />,
      title: "Active Services",
      value: activeServicesData.length ? activeServicesData.length : 0,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-orange-400",
    },
    {
      icon: <LuFileCheck2 />,
      title: "Expired Services",
      value: servicesData.length
        ? servicesData.length - activeServicesData.length
        : 0,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-red-600",
      textColour: "text-red-600",
    },
    {
      icon: <FaMoneyCheck />,
      title: "Total Earnings (Rs)",
      value: 0,
      bgColor: "bg-[#D1FADF]",
      iconColor: "text-green-900",
    },
    {
      icon: <RiTodoLine />,
      title: "Queries",
      value: queries.length ? queries.length : 0,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-green-600",
    },
    {
      icon: <RiTodoLine />,
      title: "Call Requests",
      value: callData.length ? callData.length : 0,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-green-600",
    },
    {
      icon: <MdOutlineSlowMotionVideo />,
      title: "Total Courses",
      value: 10,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-orange-400",
    },
    {
      icon: <RiStackLine />,
      title: "Courses Sold",
      value: 4,
      bgColor: "bg-[#FFF2E5]",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {data.map((item, index) => (
        <div
          key={index}
          className={`flex items-center p-4 rounded-lg shadow-sm ${item.bgColor}`}
        >
          <div className={`text-3xl p-3 rounded-full ${item.iconColor}`}>
            {item.icon}
          </div>
          <div className={`ml-4 ${item.textColour}`}>
            <p
              className={`text-sm font-medium text-gray-800 ${item.textColour}`}
            >
              {item.title}
            </p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
