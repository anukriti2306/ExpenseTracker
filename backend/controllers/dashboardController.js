const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");


exports.getDashboardData = async(req , res) =>{
    try{
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        //get the total income and expenses
        const totalIncome = await Income.aggregate([
            {$match:{userId:userObjectId}},
            {$group:{_id:null, total:{$sum:"$amount"}}},
        ]);
        console.log("totalIncome", {totalIncome, userId:isValidObjectId(userId)});
        const totalExpense = await Expense.aggregate([
            {$match:{userId:userObjectId}},
            {$group:{_id:null, total:{$sum:"$amount"}}},
        ]);
        //income txn in the last 60 days
        const last60DaysIncomeTransaction = await Income.find(
            {
                userId,
                date:{$gte: new Date(Date.now() - 60*24*60*60*1000)},

            }
        ).sort({date:-1});
        //total income for last 60 days
        const incomeLast60Days = last60DaysIncomeTransaction.reduce(
            (sum,transaction) =>sum+transaction.amount,
            0,
        );
        //get expense transactions for the last 30 days
        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            date : {$gte : new Date(Date.now() - 30 * 24 * 60 * 60 *1000)},
        }).sort({Date:-1});
        // get expense transactions for the last 60 days
        const last60DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        // get total expenses for the last 60 days
        const expensesLast60Days = last60DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        //get the total expenses for the last 30 days
        const expensesLast30Days = last30DaysExpenseTransactions.reduce(
            (sum,transaction) =>sum+transaction.amount,
            0
        );

        //fetch the last 5 transactions with income and expenses
        const lastTransactions = [
            ...(await Income.find({userId}).sort({date:-1}).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type:"income",
                })
            ),
             ...(await Expense.find({userId}).sort({date:-1}).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type:"expense",
                })
            ),
        ].sort((a,b)=>b.date-a.date);
        
        //final response
        res.json({
            totalBalance:
                (totalIncome[0]?.total||0) - (totalExpense[0]?.total||0),
            totalIncome: totalIncome[0]?.total||0,
            totalExpenses: totalExpense[0]?.total||0,
            last30DaysExpenses:{
                total:expensesLast30Days,
                transactions:last30DaysExpenseTransactions,
            },

            last60DaysExpenses:{
                total:expensesLast60Days,
                transactions:last60DaysExpenseTransactions,
            },
            recentTransactions:lastTransactions,
        });
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
}