using System;
using System.Windows;
using System.Windows.Media;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class DetailDialog : Window
    {
        private readonly Command _cmd;
        private readonly Action<Command> _onEdit;
        private readonly Action<Command> _onRun;
        private readonly Action<string> _onDelete;

        public DetailDialog(Command cmd, Action<Command> onEdit, Action<Command> onRun, Action<string> onDelete)
        {
            InitializeComponent();
            _cmd = cmd;
            _onEdit = onEdit;
            _onRun = onRun;
            _onDelete = onDelete;

            TitleText.Text = cmd.Name;
            DescText.Text = cmd.Description;
            CommandText.Text = cmd.CommandText;
            CategoryText.Text = cmd.Category;
            CategoryBadge.Background = new SolidColorBrush(Color.FromRgb(0x63, 0x66, 0xF1));
            AdminText.Text = cmd.RequiresAdmin ? "⚡ Requires Admin" : "";
        }

        private void Run_Click(object sender, RoutedEventArgs e)    { Close(); _onRun(_cmd); }
        private void Edit_Click(object sender, RoutedEventArgs e)   { Close(); _onEdit(_cmd); }
        private void Delete_Click(object sender, RoutedEventArgs e) { Close(); _onDelete(_cmd.Id); }
        private void Close_Click(object sender, RoutedEventArgs e)  => Close();
    }
}
