using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using CmdManager.Models;
using CmdManager.ViewModels;

namespace CmdManager.Views
{
    public partial class GroupFormDialog : Window
    {
        public Group? Result { get; private set; }
        private readonly Group? _existing;
        private AppViewModel VM => MainWindow.VM;

        public GroupFormDialog(Group? existing)
        {
            InitializeComponent();
            _existing = existing;
            TitleLabel.Text = existing != null ? "Edit Group" : "New Group";

            if (existing != null)
            {
                NameBox.Text = existing.Name;
                DescBox.Text = existing.Description;
            }

            PopulateChecklist(CommandCheckList, VM.Commands.Cast<object>().ToList(), c => ((Command)c).Name, c => existing?.CommandIds.Contains(((Command)c).Id) == true);
            PopulateChecklist(ChainCheckList, VM.Chains.Cast<object>().ToList(), c => ((CommandChain)c).Name, c => existing?.ChainIds.Contains(((CommandChain)c).Id) == true);
            PopulateChecklist(RegistryCheckList, VM.RegistryCommands.Cast<object>().ToList(), c => ((Command)c).Name, c => existing?.RegistryIds.Contains(((Command)c).Id) == true);
        }

        private void PopulateChecklist(StackPanel panel, List<object> items, Func<object, string> getName, Func<object, bool> isChecked)
        {
            foreach (var item in items)
            {
                var cb = new CheckBox
                {
                    Content = getName(item), IsChecked = isChecked(item),
                    Foreground = (System.Windows.Media.Brush)FindResource("TextBrush"),
                    FontSize = 13, Margin = new Thickness(0, 0, 0, 6), Tag = item
                };
                panel.Children.Add(cb);
            }
        }

        private List<string> GetCheckedIds(StackPanel panel)
        {
            var ids = new List<string>();
            foreach (var child in panel.Children)
            {
                if (child is CheckBox cb && cb.IsChecked == true)
                {
                    if (cb.Tag is Command cmd) ids.Add(cmd.Id);
                    else if (cb.Tag is CommandChain chain) ids.Add(chain.Id);
                }
            }
            return ids;
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(NameBox.Text))
            {
                MessageBox.Show("Name is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            Result = new Group
            {
                Id = _existing?.Id ?? Guid.NewGuid().ToString(),
                Name = NameBox.Text.Trim(),
                Description = DescBox.Text.Trim(),
                CommandIds = GetCheckedIds(CommandCheckList),
                ChainIds = GetCheckedIds(ChainCheckList),
                RegistryIds = GetCheckedIds(RegistryCheckList)
            };
            DialogResult = true;
        }

        private void Cancel_Click(object sender, RoutedEventArgs e) => DialogResult = false;
    }
}
