using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using CmdManager.Models;
using CmdManager.ViewModels;

namespace CmdManager.Views
{
    public partial class CommandsPage : Page
    {
        private AppViewModel VM => MainWindow.VM;
        private string _search = "";
        private string _category = "all";

        public CommandsPage()
        {
            InitializeComponent();
            LoadCategories();
            Refresh();
        }

        private void LoadCategories()
        {
            CategoryFilter.Items.Clear();
            CategoryFilter.Items.Add("all");
            var cats = VM.Commands.Select(c => c.Category).Distinct().OrderBy(x => x);
            foreach (var c in cats) CategoryFilter.Items.Add(c);
            CategoryFilter.SelectedIndex = 0;
        }

        private void Refresh()
        {
            CommandList.Children.Clear();
            var filtered = VM.Commands
                .Where(c => (c.Name.Contains(_search, StringComparison.OrdinalIgnoreCase) ||
                             c.Description.Contains(_search, StringComparison.OrdinalIgnoreCase)) &&
                            (_category == "all" || c.Category == _category))
                .ToList();

            if (filtered.Count == 0)
            {
                CommandList.Children.Add(new TextBlock
                {
                    Text = "No commands found.",
                    Foreground = (System.Windows.Media.Brush)FindResource("MutedTextBrush"),
                    FontSize = 14, Margin = new Thickness(8)
                });
                return;
            }

            foreach (var cmd in filtered)
                CommandList.Children.Add(MakeCard(cmd));
        }

        private UIElement MakeCard(Command cmd)
        {
            var border = new Border
            {
                Width = 320, Margin = new Thickness(0, 0, 12, 12),
                Background = (System.Windows.Media.Brush)FindResource("CardBrush"),
                BorderBrush = (System.Windows.Media.Brush)FindResource("BorderBrush"),
                BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(12),
                Padding = new Thickness(16), Cursor = System.Windows.Input.Cursors.Hand
            };

            var grid = new Grid();
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Row 0: shell + name
            var header = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 0, 8) };
            header.Children.Add(new TextBlock
            {
                Text = cmd.Shell == "powershell" ? ">_" : "_",
                Foreground = cmd.Shell == "powershell"
                    ? (System.Windows.Media.Brush)FindResource("AccentBrush")
                    : (System.Windows.Media.Brush)FindResource("PrimaryBrush"),
                FontFamily = (System.Windows.Media.FontFamily)FindResource("MonoFont"),
                FontSize = 14, FontWeight = FontWeights.Bold,
                VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(0, 0, 8, 0)
            });
            header.Children.Add(new TextBlock
            {
                Text = cmd.Name, FontSize = 15, FontWeight = FontWeights.SemiBold,
                Foreground = (System.Windows.Media.Brush)FindResource("TextBrush"),
                VerticalAlignment = VerticalAlignment.Center,
                TextTrimming = TextTrimming.CharacterEllipsis
            });
            Grid.SetRow(header, 0);
            grid.Children.Add(header);

            // Row 1: description
            var desc = new TextBlock
            {
                Text = cmd.Description, FontSize = 12,
                Foreground = (System.Windows.Media.Brush)FindResource("MutedTextBrush"),
                TextWrapping = TextWrapping.Wrap, MaxHeight = 52,
                Margin = new Thickness(0, 0, 0, 12),
                TextTrimming = TextTrimming.CharacterEllipsis
            };
            Grid.SetRow(desc, 1);
            grid.Children.Add(desc);

            // Row 2: category badge + action buttons
            var footer = new Grid();
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var badge = new Border
            {
                Background = CategoryColor(cmd.Category),
                CornerRadius = new CornerRadius(6), Padding = new Thickness(6, 3, 6, 3),
                HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Center
            };
            badge.Child = new TextBlock
            {
                Text = cmd.Category, FontSize = 11, FontWeight = FontWeights.SemiBold,
                Foreground = System.Windows.Media.Brushes.White
            };
            Grid.SetColumn(badge, 0);
            footer.Children.Add(badge);

            var btnPanel = new StackPanel { Orientation = Orientation.Horizontal };
            var runBtn = new Button { Content = "▶ Run", Style = (Style)FindResource("PrimaryButton"), Padding = new Thickness(10, 5, 10, 5), FontSize = 12 };
            runBtn.Click += (s, e) => { e.Handled = true; RunCommand(cmd); };
            var editBtn = new Button { Content = "✏", Style = (Style)FindResource("GhostButton"), Padding = new Thickness(7, 5, 7, 5), Margin = new Thickness(4, 0, 0, 0), FontSize = 12 };
            editBtn.Click += (s, e) => { e.Handled = true; EditCommand(cmd); };
            var delBtn = new Button { Content = "🗑", Style = (Style)FindResource("GhostButton"), Padding = new Thickness(7, 5, 7, 5), Margin = new Thickness(4, 0, 0, 0), FontSize = 12 };
            delBtn.Click += (s, e) => { e.Handled = true; DeleteCommand(cmd); };
            btnPanel.Children.Add(runBtn);
            btnPanel.Children.Add(editBtn);
            btnPanel.Children.Add(delBtn);
            Grid.SetColumn(btnPanel, 1);
            footer.Children.Add(btnPanel);

            Grid.SetRow(footer, 2);
            grid.Children.Add(footer);

            border.Child = grid;
            border.MouseLeftButtonUp += (s, e) => ShowDetail(cmd);
            return border;
        }

        private void RunCommand(Command cmd)
        {
            var dlg = new RunCommandDialog(cmd) { Owner = Window.GetWindow(this) };
            dlg.ShowDialog();
        }

        private void ShowDetail(Command cmd)
        {
            var dlg = new DetailDialog(cmd,
                onEdit: c => EditCommand(c),
                onRun: c => RunCommand(c),
                onDelete: id => DeleteCommand(cmd))
            { Owner = Window.GetWindow(this) };
            dlg.ShowDialog();
        }

        private void EditCommand(Command cmd)
        {
            var dlg = new CommandFormDialog(cmd) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.UpdateCommand(dlg.Result!);
                LoadCategories();
                Refresh();
            }
        }

        private void DeleteCommand(Command cmd)
        {
            if (MessageBox.Show($"Delete \"{cmd.Name}\"?", "Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                VM.DeleteCommand(cmd.Id);
                LoadCategories();
                Refresh();
            }
        }

        private void AddCommand_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new CommandFormDialog(null) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.AddCommand(dlg.Result!);
                LoadCategories();
                Refresh();
            }
        }

        private void Search_Changed(object sender, TextChangedEventArgs e)
        {
            _search = SearchBox.Text;
            Refresh();
        }

        private void Category_Changed(object sender, SelectionChangedEventArgs e)
        {
            _category = CategoryFilter.SelectedItem?.ToString() ?? "all";
            Refresh();
        }

        private System.Windows.Media.Brush CategoryColor(string cat) => cat switch
        {
            "network"     => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x38, 0x82, 0xF4)),
            "security"    => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xEF, 0x44, 0x44)),
            "maintenance" => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0xF9, 0x73, 0x16)),
            "system"      => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x8B, 0x5C, 0xF6)),
            "hardware"    => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x10, 0xB9, 0x81)),
            "storage"     => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x64, 0x74, 0x8B)),
            "info"        => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x06, 0xB6, 0xD4)),
            _             => new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x6B, 0x72, 0x80)),
        };
    }
}
