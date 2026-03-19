using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class ChainDetailDialog : Window
    {
        private readonly CommandChain _chain;
        private readonly Action<CommandChain> _onEdit;
        private readonly Action<CommandChain> _onRun;
        private readonly Action<string> _onDelete;

        public ChainDetailDialog(CommandChain chain, Action<CommandChain> onEdit, Action<CommandChain> onRun, Action<string> onDelete)
        {
            InitializeComponent();
            _chain = chain;
            _onEdit = onEdit;
            _onRun = onRun;
            _onDelete = onDelete;

            TitleText.Text = chain.Name;
            DescText.Text = chain.Description;

            for (int i = 0; i < chain.Steps.Count; i++)
            {
                var s = chain.Steps[i];
                var row = new StackPanel
                {
                    Margin = new Thickness(0, 0, 0, 6),
                    Background = new SolidColorBrush(Color.FromArgb(0x10, 0xFF, 0xFF, 0xFF))
                };
                var hdr = new Border
                {
                    Padding = new Thickness(10, 6, 10, 0)
                };
                hdr.Child = new TextBlock
                {
                    Text = $"Step {i + 1}: {s.Prefix}", FontSize = 11,
                    Foreground = (Brush)FindResource("MutedTextBrush")
                };
                row.Children.Add(hdr);
                var cmdRow = new Border { Padding = new Thickness(10, 4, 10, 8) };
                cmdRow.Child = new TextBlock
                {
                    Text = s.CommandText, FontFamily = new FontFamily("Consolas"),
                    FontSize = 12, Foreground = (Brush)FindResource("TextBrush"),
                    TextWrapping = TextWrapping.Wrap
                };
                row.Children.Add(cmdRow);
                StepList.Children.Add(row);
            }
        }

        private void Run_Click(object sender, RoutedEventArgs e)    { Close(); _onRun(_chain); }
        private void Edit_Click(object sender, RoutedEventArgs e)   { Close(); _onEdit(_chain); }
        private void Delete_Click(object sender, RoutedEventArgs e) { Close(); _onDelete(_chain.Id); }
        private void Close_Click(object sender, RoutedEventArgs e)  => Close();
    }
}
