const User = require("../models/User");
const Expense = require("../models/Expense");
const XLSX = require("xlsx");
//Add Expense Source
exports.addExpense = async (req, res) =>{
    const userId=req.user.id;
    try{
        const {icon, category, amount, date} = req.body;
        //Validation:checking for  missing fields
        if(!category || !amount || !date){
            return res.status(400).json({message:"All fields are required."});

        }
        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date : new Date(date)
        });
        await newExpense.save();
        res.status(200).json(newExpense);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }

};

//Get all Expense Source
exports.getAllExpense = async (req, res) =>{
    const userId = req.user.id;
    try{
        const expense = await Expense.find({userId}).sort({date:-1});
        res.json(expense);
    }catch(error){
        res.status(500).json({message:"Server error."});
    }
};

//Delete Expense Source
exports.deleteExpense = async (req, res) =>{
    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Expense deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        // ✅ Fix: typo in "expense"
        const data = expense.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date.toISOString().split("T")[0], // Optional: Format date as YYYY-MM-DD
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "expense");

        // ✅ Write to buffer instead of disk
        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        // ✅ Set proper headers
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="expense_data.xlsx"'
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};