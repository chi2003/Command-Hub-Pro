using System;
using System.Windows;
using System.Windows.Controls;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class CommandFormDialog : Window
    {
        public Command? Result { get; private set; }
        private readonly Command? _existing;

        public CommandFormDialog(Command? existing)
        {
            InitializeComponent();
            _existing = existing;

            if (existing != null)
            {
                TitleLabel.Text = "Edit Command";
                NameBox.Text = existing.Name;
                CommandBox.Text = existing.CommandText;
                DescBox.Text = existing.Description;
                CategoryBox.Text = existing.Category;
                AdminBox.IsChecked = existing.RequiresAdmin;

                foreach (ComboBoxItem item in ShellBox.Items)
                    if (item.Content?.ToString() == existing.Shell)
                    { ShellBox.SelectedItem = item; break; }
            }
            else
            {
                TitleLabel.Text = "New Command";
                ShellBox.SelectedIndex = 0;
            }
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(NameBox.Text) || string.IsNullOrWhiteSpace(CommandBox.Text))
            {
                MessageBox.Show("Name and Command are required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            Result = new Command
            {
                Id = _existing?.Id ?? Guid.NewGuid().ToString(),
                Name = NameBox.Text.Trim(),
                CommandText = CommandBox.Text.Trim(),
                Description = DescBox.Text.Trim(),
                Category = string.IsNullOrWhiteSpace(CategoryBox.Text) ? "general" : CategoryBox.Text.Trim().ToLower(),
                Shell = (ShellBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "both",
                RequiresAdmin = AdminBox.IsChecked == true
            };

            DialogResult = true;
        }

        private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
    }
}
