const User = require("../models/User");
const Income = require("../models/Income");
const XLSX = require("xlsx");
//Add Income Source
exports.addIncome = async (req, res) =>{
    const userId=req.user.id;
    try{
        const {icon, source, amount, date} = req.body;
        //Validation:checking for  missing fields
        if(!source || !amount || !date){
            return res.status(400).json({message:"All fields are required."});

        }
        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date : new Date(date)
        });
        await newIncome.save();
        res.status(200).json(newIncome);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }

};

//Get all Income Source
exports.getAllIncome = async (req, res) =>{
    const userId = req.user.id;
    try{
        const income = await Income.find({userId}).sort({date:-1});
        res.json(income);
    }catch(error){
        res.status(500).json({message:"Server error."});
    }
};

//Delete Income Source
exports.deleteIncome = async (req, res) =>{
    try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({message:"Income deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userId }).sort({ date: -1 });

        // ✅ Fix: typo in "income"
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split("T")[0], // Optional: Format date as YYYY-MM-DD
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Income");

        // ✅ Write to buffer instead of disk
        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        // ✅ Set proper headers
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="income_data.xlsx"'
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