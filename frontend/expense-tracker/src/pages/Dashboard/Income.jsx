import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
const Income = () =>{
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading]=useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show:false,
    data:null,
  });

  const [OpenAddIncomeModel, setOpenAddIncomeModel] = useState(false);
  
  //getting all the income details
  const fetchIncomeDetails = async()=>{
    if(loading) return;
    setLoading(true);
    try{
      const response= await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );
      if(response.data){
        setIncomeData(response.data);
      }
    }catch(error){
      console.log("Something went wrong. Please try again later.",error);
    }finally{
      setLoading(false);
    }
  };
  //handling add income
  const handleAddIncome = async(income)=>{};
  //delete income
  const deleteIncome = async(id) =>{};
  //handle download income details
  const handleDownloadIncomeDetails = async(id) =>{};

  useEffect(() => {
    fetchIncomeDetails();
  
    return () => {};
  }, []);
  
  return(
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={()=>setOpenAddIncomeModel(true)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>    
  );
};
export default Income;